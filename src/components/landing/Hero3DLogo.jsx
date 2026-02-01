import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

/**
 * Hero3DLogo - Advanced 3D PBR text rendering for GENDOCX
 * Implements high-end metallic shading with anisotropy and clearcoat
 * Static professional presentation without mouse interaction
 */
export default function Hero3DLogo({ className = '' }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const materialUniforms = {
      time: { value: 0 },
      mousePosition: { value: new THREE.Vector2(0.8, 0.8) }, // Fixed professional light position
      roughness: { value: 0.05 },
      anisotropy: { value: 0.0 },
      ior: { value: 2.95 },
      clearcoat: { value: 0.0 },
      dispersion: { value: 0.0 },
      metalColor: { value: new THREE.Vector3(0.95, 0.95, 0.98) }, // Chrome-like
      lightTemperature: { value: new THREE.Vector3(1, 1, 1) }
    };

    const customMaterial = new THREE.ShaderMaterial({
      uniforms: materialUniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec3 objectTangent = vec3(1.0, 0.0, 0.0);
          vTangent = normalize(normalMatrix * objectTangent);
          vBitangent = cross(vNormal, vTangent);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 mousePosition;
        uniform float roughness;
        uniform float anisotropy;
        uniform float ior;
        uniform float clearcoat;
        uniform float dispersion;
        uniform vec3 metalColor;
        uniform vec3 lightTemperature;
        
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        
        vec3 fresnelSchlick(float cosTheta, vec3 F0) {
          return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
        }
        
        float distributionAnisotropicGGX(vec3 N, vec3 H, vec3 T, vec3 B, float roughness, float anisotropy) {
          float roughnessT = roughness * (1.0 + anisotropy);
          float roughnessB = roughness * (1.0 - anisotropy);
          float d = dot(T, H) * dot(T, H) / (roughnessT * roughnessT) + 
                   dot(B, H) * dot(B, H) / (roughnessB * roughnessB) + 
                   dot(N, H) * dot(N, H);
          return 1.0 / (3.14159265359 * roughnessT * roughnessB * d * d);
        }
        
        float geometrySchlickGGX(float NdotV, float roughness) {
          float r = (roughness + 1.0);
          float k = (r * r) / 8.0;
          return NdotV / (NdotV * (1.0 - k) + k);
        }
        
        float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
          return geometrySchlickGGX(max(dot(N, V), 0.0), roughness) * 
                 geometrySchlickGGX(max(dot(N, L), 0.0), roughness);
        }
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 tangent = normalize(vTangent);
          vec3 bitangent = normalize(vBitangent);
          vec3 viewDir = normalize(vViewPosition);
          
          vec3 lightPos1 = vec3((mousePosition.x - 0.5) * 10.0, (mousePosition.y - 0.5) * 10.0, 5.0);
          vec3 lightPos2 = vec3(-3.0, 3.0, 5.0);
          vec3 lightPos3 = vec3(3.0, -3.0, 5.0);
          
          vec3 color = vec3(0.0);
          vec3 lights[3]; lights[0] = lightPos1; lights[1] = lightPos2; lights[2] = lightPos3;
          vec3 lightColors[3]; lightColors[0] = lightTemperature; lightColors[1] = vec3(0.5, 0.5, 0.7) * lightTemperature; lightColors[2] = vec3(0.7, 0.5, 0.5) * lightTemperature;
          
          for(int i = 0; i < 3; i++) {
            vec3 lightDir = normalize(lights[i] - vWorldPosition);
            vec3 halfwayDir = normalize(lightDir + viewDir);
            float n2 = ior;
            float F0_scalar = pow((1.0 - n2) / (1.0 + n2), 2.0);
            vec3 F0 = mix(vec3(F0_scalar), metalColor, 0.95);
            
            float D = distributionAnisotropicGGX(normal, halfwayDir, tangent, bitangent, roughness, anisotropy);
            float G = geometrySmith(normal, viewDir, lightDir, roughness);
            vec3 F = fresnelSchlick(max(dot(halfwayDir, viewDir), 0.0), F0);
            
            vec3 numerator = D * G * F;
            float denominator = 4.0 * max(dot(normal, viewDir), 0.0) * max(dot(normal, lightDir), 0.0) + 0.0001;
            vec3 specular = numerator / denominator;
            
            float NdotL = max(dot(normal, lightDir), 0.0);
            color += specular * lightColors[i] * NdotL;
          }
          
          color += metalColor * 0.03 * lightTemperature;
          color = color / (color + vec3(1.0));
          color = pow(color, vec3(1.0/2.2));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    let textMesh;
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
      const geometry = new TextGeometry('GENDOCX', {
        font: font,
        size: 1.5,
        height: 0.4,
        curveSegments: 32,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.05,
        bevelSegments: 16
      });
      geometry.center();
      textMesh = new THREE.Mesh(geometry, customMaterial);
      textMesh.rotation.x = 0.2;
      textMesh.rotation.y = -0.2;
      scene.add(textMesh);
    });

    // Fallback if font fails
    setTimeout(() => {
      if (!textMesh) {
        const geometry = new THREE.BoxGeometry(6, 1.5, 0.5);
        textMesh = new THREE.Mesh(geometry, customMaterial);
        textMesh.rotation.x = 0.2;
        textMesh.rotation.y = -0.2;
        scene.add(textMesh);
      }
    }, 2000);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      materialUniforms.time.value += 0.01;

      // Static presentation - no rotation drift

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full perspective-1000 ${className}`}
      style={{ minHeight: '350px' }}
    />
  );
}