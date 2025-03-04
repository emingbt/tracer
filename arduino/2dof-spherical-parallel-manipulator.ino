#define STEP_X 2
#define DIR_X 5
#define STEP_Y 3
#define DIR_Y 6

const int stepsPerRevolution = 3200;                      // 1.8° per step with 1/16 microstepping
const float degreesPerStep = 360.0 / stepsPerRevolution;  // Angle per step

void setup() {
  Serial.begin(9600);
  pinMode(STEP_X, OUTPUT);
  pinMode(DIR_X, OUTPUT);
  pinMode(STEP_Y, OUTPUT);
  pinMode(DIR_Y, OUTPUT);
}

// Function to move both steppers in parallel
void moveSteppers(float angleX, float angleY) {
  int stepsX = abs(angleX / degreesPerStep);
  int stepsY = abs(angleY / degreesPerStep);

  digitalWrite(DIR_X, (angleX >= 0) ? HIGH : LOW);
  digitalWrite(DIR_Y, (angleY >= 0) ? HIGH : LOW);

  int maxSteps = max(stepsX, stepsY);
  int stepX = 0, stepY = 0;

  for (int i = 0; i < maxSteps; i++) {
    if (stepX < stepsX && (stepX * maxSteps) / stepsX <= i) {
      digitalWrite(STEP_X, HIGH);
      delayMicroseconds(500);
      digitalWrite(STEP_X, LOW);
      delayMicroseconds(500);
      stepX++;
    }

    if (stepY < stepsY && (stepY * maxSteps) / stepsY <= i) {
      digitalWrite(STEP_Y, HIGH);
      delayMicroseconds(500);
      digitalWrite(STEP_Y, LOW);
      delayMicroseconds(500);
      stepY++;
    }

    delayMicroseconds(200);  // Adjust for smooth movement
  }

  Serial.println("OK");
}

// Function to process G-code
void processGCode(String command) {
  float xTarget = 0, yTarget = 0;

  if (command.startsWith("G1")) {  // Linear move command
    int xIndex = command.indexOf('X');
    int yIndex = command.indexOf('Y');

    if (xIndex != -1) xTarget = command.substring(xIndex + 1).toFloat();
    if (yIndex != -1) yTarget = command.substring(yIndex + 1).toFloat();

    moveSteppers(xTarget, yTarget);
  }
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    Serial.println(command);
    processGCode(command);
  }
}
