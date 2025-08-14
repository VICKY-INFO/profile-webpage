// Load Three.js library from a CDN
// Note: This script assumes three.min.js is loaded in the HTML file before this script.

document.addEventListener('DOMContentLoaded', () => {
    // --- Dark/Light Mode Toggle Logic ---
    const body = document.body;
    const modeToggle = document.getElementById('mode-toggle');
    const toggleIcon = modeToggle.querySelector('i');

    // Function to set the mode based on the user's preference
    function setMode(isDarkMode) {
        if (isDarkMode) {
            body.classList.add('dark-mode');
            toggleIcon.classList.remove('fa-sun');
            toggleIcon.classList.add('fa-moon');
        } else {
            body.classList.remove('dark-mode');
            toggleIcon.classList.remove('fa-moon');
            toggleIcon.classList.add('fa-sun');
        }
    }

    // Check for user's preference in localStorage on page load
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        setMode(true);
    } else {
        setMode(false);
    }

    // Event listener for the toggle button
    modeToggle.addEventListener('click', () => {
        const isDarkMode = body.classList.toggle('dark-mode');
        if (isDarkMode) {
            toggleIcon.classList.remove('fa-sun');
            toggleIcon.classList.add('fa-moon');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            toggleIcon.classList.remove('fa-moon');
            toggleIcon.classList.add('fa-sun');
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // --- Smooth Scrolling Functionality ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Prevent the default anchor jump behavior
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Get the height of the fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                // Smoothly scroll to the calculated position
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// --- Three.js Particle Animation Script ---
window.onload = function() {
    const canvas = document.getElementById('home-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create particles
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x8ab4f8, // Primary color for particles (light blue for dark mode)
        size: 2,
        sizeAttenuation: true
    });

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 500;
        positions[i3 + 1] = (Math.random() - 0.5) * 500;
        positions[i3 + 2] = (Math.random() - 0.5) * 500;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Connective lines
    const linesGeometry = new THREE.BufferGeometry();
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0x4285F4, // Primary color for lines
        transparent: true,
        opacity: 0.1
    });
    const linePositions = new Float32Array(particleCount * 6);
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(lines);

    camera.position.z = 200;

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    scene.add(pointLight);

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', onMouseMove, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);

    function animate() {
        requestAnimationFrame(animate);

        // Update particle positions and line connections
        const positions = particles.attributes.position.array;
        const linePositions = lines.geometry.attributes.position.array;
        let lineIndex = 0;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        // Move particles slightly
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] += Math.sin(Date.now() * 0.0005 + i) * 0.1;
            positions[i3 + 1] += Math.cos(Date.now() * 0.0005 + i) * 0.1;
            positions[i3 + 2] += Math.sin(Date.now() * 0.0005 + i) * 0.1;
        }
        
        // Reset line connections
        for (let i = 0; i < linePositions.length; i++) {
            linePositions[i] = 0;
        }

        // Connect nearby particles or particles near the mouse
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dist = Math.sqrt(
                    (positions[i * 3] - positions[j * 3]) ** 2 +
                    (positions[i * 3 + 1] - positions[j * 3 + 1]) ** 2 +
                    (positions[i * 3 + 2] - positions[j * 3 + 2]) ** 2
                );
                if (dist < 40) {
                    linePositions[lineIndex++] = positions[i * 3];
                    linePositions[lineIndex++] = positions[i * 3 + 1];
                    linePositions[lineIndex++] = positions[i * 3 + 2];
                    linePositions[lineIndex++] = positions[j * 3];
                    linePositions[lineIndex++] = positions[j * 3 + 1];
                    linePositions[lineIndex++] = positions[j * 3 + 2];
                }
            }
        }

        lines.geometry.attributes.position.needsUpdate = true;
        particles.attributes.position.needsUpdate = true;

        // Move point light with mouse
        pointLight.position.x = mouse.x * 200;
        pointLight.position.y = mouse.y * 200;

        renderer.render(scene, camera);
    }
    animate();
};
