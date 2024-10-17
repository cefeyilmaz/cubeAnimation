    function multiplyMatrices(matrixA, matrixB) {
        var result = [];

        for (var i = 0; i < 4; i++) {
            result[i] = [];
            for (var j = 0; j < 4; j++) {
                var sum = 0;
                for (var k = 0; k < 4; k++) {
                    sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
                }
                result[i][j] = sum;
            }
        }

        // Flatten the result array
        return result.reduce((a, b) => a.concat(b), []);
    }
    function createIdentityMatrix() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    function createScaleMatrix(scale_x, scale_y, scale_z) {
        return new Float32Array([
            scale_x, 0, 0, 0,
            0, scale_y, 0, 0,
            0, 0, scale_z, 0,
            0, 0, 0, 1
        ]);
    }

    function createTranslationMatrix(x_amount, y_amount, z_amount) {
        return new Float32Array([
            1, 0, 0, x_amount,
            0, 1, 0, y_amount,
            0, 0, 1, z_amount,
            0, 0, 0, 1
        ]);
    }

    function createRotationMatrix_Z(radian) {
        return new Float32Array([
            Math.cos(radian), -Math.sin(radian), 0, 0,
            Math.sin(radian), Math.cos(radian), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ])
    }

    function createRotationMatrix_X(radian) {
        return new Float32Array([
            1, 0, 0, 0,
            0, Math.cos(radian), -Math.sin(radian), 0,
            0, Math.sin(radian), Math.cos(radian), 0,
            0, 0, 0, 1
        ])
    }

    function createRotationMatrix_Y(radian) {
        return new Float32Array([
            Math.cos(radian), 0, Math.sin(radian), 0,
            0, 1, 0, 0,
            -Math.sin(radian), 0, Math.cos(radian), 0,
            0, 0, 0, 1
        ])
    }

    function getTransposeMatrix(matrix) {
        return new Float32Array([
            matrix[0], matrix[4], matrix[8], matrix[12],
            matrix[1], matrix[5], matrix[9], matrix[13],
            matrix[2], matrix[6], matrix[10], matrix[14],
            matrix[3], matrix[7], matrix[11], matrix[15]
        ]);
    }

    const vertexShaderSource = `
    attribute vec3 position;
    attribute vec3 normal; // Normal vector for lighting

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat4 normalMatrix;

    uniform vec3 lightDirection;

    varying vec3 vNormal;
    varying vec3 vLightDirection;

    void main() {
        vNormal = vec3(normalMatrix * vec4(normal, 0.0));
        vLightDirection = lightDirection;

        gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
    }

    `

    const fragmentShaderSource = `
    precision mediump float;

    uniform vec3 ambientColor;
    uniform vec3 diffuseColor;
    uniform vec3 specularColor;
    uniform float shininess;

    varying vec3 vNormal;
    varying vec3 vLightDirection;

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(vLightDirection);
        
        // Ambient component
        vec3 ambient = ambientColor;

        // Diffuse component
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * diffuseColor;

        // Specular component (view-dependent)
        vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
        vec3 specular = spec * specularColor;

        gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
    }

    `

    /**
     * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
     */



    /**
     * 
     * @TASK1 Calculate the model view matrix by using the chatGPT
     */

    function getChatGPTModelViewMatrix() {


        const transformationMatrix = new Float32Array([
            0.1767766922712326,
            -0.3061862289905548,
            0.3535533845424652,
            0.30000001192092896,
            0.4633883535861969,
            0.06341324001550674,
            -0.1767766922712326,
            -0.25,
            0.1268264800310135,
            0.7803300619125366,
            0.6123724579811096,
            0.0,
            0.0,
            0.0,
            0.0,
            1.0
        ]);
        

        return getTransposeMatrix(transformationMatrix);
    }


    /**
     * 
     * @TASK2 Calculate the model view matrix by using the given 
     * transformation methods and required transformation parameters
     * stated in transformation-prompt.txt
     */
    function getModelViewMatrix() {

        // Function to turn degree to radian
        function degToRad(degrees) {
            return degrees * (Math.PI / 180);
        }
        
        // Define transformation parameters
        const scaleX = 0.5, scaleY = 0.5, scaleZ = 1;
        const translateX = 0.3, translateY = -0.25, translateZ = 0;
        const rotationX = degToRad(30); // Convert 30 degrees to radians
        const rotationY = degToRad(45); // Convert 45 degrees to radians
        const rotationZ = degToRad(60); // Convert 60 degrees to radians
        
        // Start with the identity matrix
        let modelViewMatrix = createIdentityMatrix();

        // The order of transformation should be this : Scaling -> Rotation -> Translation
        // So, we should multiply it backwards, starting with translation matrix

        const translationMatrix = createTranslationMatrix(translateX, translateY, translateZ);
        modelViewMatrix = multiplyMatrices(modelViewMatrix, translationMatrix);

        const rotationZMatrix = createRotationMatrix_Z(rotationZ);
        modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationZMatrix);
        const rotationYMatrix = createRotationMatrix_Y(rotationY);
        modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationYMatrix);
        const rotationXMatrix = createRotationMatrix_X(rotationX);
        modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationXMatrix);        

        const scaleMatrix = createScaleMatrix(scaleX, scaleY, scaleZ);
        modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);
        
        return modelViewMatrix;

    }

    /**
     * 
     * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
     * task2 infinitely with a period of 10 seconds. 
     * First 5 seconds, the cube should transform from its initial 
     * position to the target position.
     * The next 5 seconds, the cube should return to its initial position.
     */

    function getPeriodicMovement(startTime) {
        const currentTime = (Date.now() - startTime) / 1000; // Get time in seconds
        const totalDuration = 10; // Total duration for the animation
        const halfDuration = totalDuration / 2; // Duration for each phase

        // Normalize the current time
        const normalizedTime = currentTime % totalDuration;

        // Determine the phase of the animation and the interpolation factor
        let t;
        if (normalizedTime < halfDuration) {
            // First half (0 to 5 seconds): Transition to target transformationMatrix
            t = normalizedTime / halfDuration; // From 0 to 1
        } else {
            // Second half (5 to 10 seconds): Transition back to identity matrix
            t = (normalizedTime - halfDuration) / halfDuration; // From 0 to 1
        }

        // Smooth transition using a sine function for easing
        t = (1 - Math.cos(t * Math.PI)) / 2; // Easing function for smooth transition

        // Interpolate between matrices
        if (normalizedTime < halfDuration) {
            return interpolateMatrices(createIdentityMatrix(), getModelViewMatrix(), t);
        } else {
            return interpolateMatrices(getModelViewMatrix(), createIdentityMatrix(), t);
        }
    }


    function interpolateMatrices(matrixA, matrixB, t) {
        const result = new Float32Array(16);
        for (let i = 0; i < 16; i++) {
            result[i] = matrixA[i] + t * (matrixB[i] - matrixA[i]);
        }
        return result;
    }








