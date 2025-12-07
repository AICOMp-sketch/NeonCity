        // Scene Setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0a0f, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 30, 80);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.5;
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x00f5ff, 2, 100);
        pointLight1.position.set(20, 50, 20);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
        pointLight2.position.set(-20, 50, -20);
        scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0xffff00, 1, 80);
        pointLight3.position.set(0, 30, 40);
        scene.add(pointLight3);

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0f,
            metalness: 0.8,
            roughness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        scene.add(ground);

        // Grid
        const gridHelper = new THREE.GridHelper(200, 50, 0x00f5ff, 0x1a1a2e);
        gridHelper.position.y = 0.1;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Buildings
        const buildings = [];
        const buildingColors = [0x00f5ff, 0xff00ff, 0x00ff88, 0xff6600, 0xffff00, 0x0080ff];

        function createBuilding(x, z) {
            const height = Math.random() * 40 + 10;
            const width = Math.random() * 4 + 2;
            const depth = Math.random() * 4 + 2;

            const geometry = new THREE.BoxGeometry(width, height, depth);
            
            // Create material with emissive properties
            const colorIndex = Math.floor(Math.random() * buildingColors.length);
            const material = new THREE.MeshStandardMaterial({
                color: 0x1a1a2e,
                metalness: 0.9,
                roughness: 0.1,
                emissive: buildingColors[colorIndex],
                emissiveIntensity: 0.1
            });

            const building = new THREE.Mesh(geometry, material);
            building.position.set(x, height / 2, z);
            building.userData = { 
                baseHeight: height,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulseOffset: Math.random() * Math.PI * 2
            };

            // Add windows
            addWindows(building, width, height, depth, buildingColors[colorIndex]);

            scene.add(building);
            buildings.push(building);
            return building;
        }

        function addWindows(building, width, height, depth, color) {
            const windowGeometry = new THREE.PlaneGeometry(0.5, 0.8);
            const windowMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: Math.random() * 0.5 + 0.5
            });

            const windowRows = Math.floor(height / 3);
            const windowCols = Math.floor(width / 1.5);

            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    if (Math.random() > 0.3) {
                        const window = new THREE.Mesh(windowGeometry, windowMaterial.clone());
                        window.position.set(
                            (col - windowCols / 2 + 0.5) * 1.2,
                            (row - windowRows / 2 + 0.5) * 2.5,
                            depth / 2 + 0.01
                        );
                        building.add(window);

                        // Random window animation
                        window.userData = {
                            flickerSpeed: Math.random() * 0.1,
                            flickerOffset: Math.random() * 100
                        };
                    }
                }
            }
        }

        // Create city grid
        for (let x = -80; x <= 80; x += 10) {
            for (let z = -80; z <= 80; z += 10) {
                // Leave roads
                if (Math.abs(x) % 30 < 8 || Math.abs(z) % 30 < 8) continue;
                
                if (Math.random() > 0.2) {
                    createBuilding(x + Math.random() * 4 - 2, z + Math.random() * 4 - 2);
                }
            }
        }

        // Particles
        const particleCount = 5000;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            particlePositions[i * 3] = (Math.random() - 0.5) * 200;
            particlePositions[i * 3 + 1] = Math.random() * 100;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 200;

            const color = new THREE.Color(buildingColors[Math.floor(Math.random() * buildingColors.length)]);
            particleColors[i * 3] = color.r;
            particleColors[i * 3 + 1] = color.g;
            particleColors[i * 3 + 2] = color.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Flying cars (light trails)
        const cars = [];
        for (let i = 0; i < 15; i++) {
            const carGeometry = new THREE.BoxGeometry(2, 0.5, 0.5);
            const carMaterial = new THREE.MeshBasicMaterial({
                color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
                transparent: true,
                opacity: 0.8
            });
            const car = new THREE.Mesh(carGeometry, carMaterial);
            
            car.position.set(
                (Math.random() - 0.5) * 150,
                Math.random() * 30 + 20,
                (Math.random() - 0.5) * 150
            );
            
            car.userData = {
                speed: Math.random() * 0.5 + 0.2,
                direction: Math.random() > 0.5 ? 1 : -1,
                axis: Math.random() > 0.5 ? 'x' : 'z'
            };
            
            scene.add(car);
            cars.push(car);
        }

        // Neon signs
        function createNeonSign(x, y, z) {
            const geometry = new THREE.TorusGeometry(2, 0.2, 8, 32);
            const material = new THREE.MeshBasicMaterial({
                color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
                transparent: true,
                opacity: 0.9
            });
            const sign = new THREE.Mesh(geometry, material);
            sign.position.set(x, y, z);
            sign.rotation.y = Math.random() * Math.PI;
            scene.add(sign);
            return sign;
        }

        // Add some neon signs
        for (let i = 0; i < 20; i++) {
            createNeonSign(
                (Math.random() - 0.5) * 100,
                Math.random() * 20 + 30,
                (Math.random() - 0.5) * 100
            );
        }

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        });

        // Scroll interaction
        let scrollY = 0;
        document.addEventListener('wheel', (event) => {
            scrollY += event.deltaY * 0.01;
            scrollY = Math.max(-20, Math.min(50, scrollY));
        });

        // Animation
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            
            const time = clock.getElapsedTime();

            // Camera movement
            targetRotationY = mouseX * 0.5;
            targetRotationX = mouseY * 0.3;
            
            camera.position.x += (mouseX * 30 - camera.position.x) * 0.02;
            camera.position.y = 30 + Math.sin(time * 0.5) * 5 - scrollY * 0.5;
            camera.position.z = 80 - scrollY;
            
            camera.lookAt(0, 20, 0);

            // Animate particles
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3 + 1] += 0.05;
                if (positions[i * 3 + 1] > 100) {
                    positions[i * 3 + 1] = 0;
                }
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.rotation.y += 0.0005;

            // Animate buildings
            buildings.forEach((building, index) => {
                const pulse = Math.sin(time * building.userData.pulseSpeed + building.userData.pulseOffset);
                building.material.emissiveIntensity = 0.05 + pulse * 0.05;
                
                // Animate windows
                building.children.forEach(window => {
                    if (window.userData.flickerSpeed) {
                        const flicker = Math.sin(time * window.userData.flickerSpeed * 10 + window.userData.flickerOffset);
                        window.material.opacity = 0.3 + flicker * 0.4;
                    }
                });
            });

            // Animate cars
            cars.forEach(car => {
                if (car.userData.axis === 'x') {
                    car.position.x += car.userData.speed * car.userData.direction;
                    if (Math.abs(car.position.x) > 100) {
                        car.userData.direction *= -1;
                    }
                } else {
                    car.position.z += car.userData.speed * car.userData.direction;
                    if (Math.abs(car.position.z) > 100) {
                        car.userData.direction *= -1;
                    }
                }
            });

            // Animate lights
            pointLight1.position.x = Math.sin(time * 0.5) * 30;
            pointLight1.position.z = Math.cos(time * 0.5) * 30;
            
            pointLight2.position.x = Math.sin(time * 0.3 + Math.PI) * 30;
            pointLight2.position.z = Math.cos(time * 0.3 + Math.PI) * 30;

            renderer.render(scene, camera);
        }

        // Window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Hide loader
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
        }, 2500);

        // Start animation
        animate();

        // Button interactions
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Add ripple effect or transition
                scrollY = Math.min(scrollY + 20, 50);
            });
        });