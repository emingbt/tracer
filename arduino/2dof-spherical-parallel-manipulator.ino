#define STEP_X 2
#define DIR_X 5
#define STEP_Y 3
#define DIR_Y 6

#define HALL_X 9
#define HALL_Y 10

#define LASER 11

const int stepsPerRevolution = 3200;
const float degreesPerStep = 360.0 / stepsPerRevolution;

const int X_STEPS_TO_HOME = 235;
const int Y_STEPS_TO_HOME = 205;

const int MIN_DELAY = 100;
const int MAX_DELAY = 1000;
const int ACCEL_STEPS = 40;

void setup() {
  Serial.begin(9600);
  pinMode(STEP_X, OUTPUT);
  pinMode(DIR_X, OUTPUT);
  pinMode(STEP_Y, OUTPUT);
  pinMode(DIR_Y, OUTPUT);

  pinMode(HALL_X, INPUT);  // Set Hall effect sensor pins as input with pull-up resistor
  pinMode(HALL_Y, INPUT);

  pinMode(LASER, OUTPUT);

  while (!Serial) {}  // Wait for serial connection (for boards like Leonardo)

  digitalWrite(LASER, HIGH);
  Serial.println("READY");  // Indicate that Arduino is ready
}

void calibrate() {
  digitalWrite(DIR_X, HIGH);
  while (digitalRead(HALL_X) == LOW) {
    digitalWrite(STEP_X, HIGH);
    delayMicroseconds(10000);
    digitalWrite(STEP_X, LOW);
    delayMicroseconds(10000);
  }
  digitalWrite(DIR_X, LOW);
  for (int i = 0; i < X_STEPS_TO_HOME; i++) {
    digitalWrite(STEP_X, HIGH);
    delayMicroseconds(3000);
    digitalWrite(STEP_X, LOW);
    delayMicroseconds(3000);
  }

  digitalWrite(DIR_Y, LOW);
  while (digitalRead(HALL_Y) == LOW) {
    digitalWrite(STEP_Y, HIGH);
    delayMicroseconds(10000);
    digitalWrite(STEP_Y, LOW);
    delayMicroseconds(10000);
  }
  digitalWrite(DIR_Y, HIGH);
  for (int i = 0; i < Y_STEPS_TO_HOME; i++) {
    digitalWrite(STEP_Y, HIGH);
    delayMicroseconds(3000);
    digitalWrite(STEP_Y, LOW);
    delayMicroseconds(3000);
  }

  Serial.println("CALIBRATED");
}

int calculateDelay(int currentStep, int totalSteps) {
  if (currentStep < ACCEL_STEPS) {
    // Acceleration phase - quadratic curve
    float progress = (float)currentStep / ACCEL_STEPS;
    return MAX_DELAY - (MAX_DELAY - MIN_DELAY) * progress * progress;
  } else if (currentStep > totalSteps - ACCEL_STEPS) {
    // Deceleration phase - quadratic curve
    float progress = (float)(totalSteps - currentStep) / ACCEL_STEPS;
    return MAX_DELAY - (MAX_DELAY - MIN_DELAY) * progress * progress;
  } else {
    // Constant speed phase
    return MIN_DELAY;
  }
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
    int currentDelay = calculateDelay(i, maxSteps);

    if (stepX < stepsX && (stepX * maxSteps) / stepsX <= i) {
      digitalWrite(STEP_X, HIGH);
      delayMicroseconds(currentDelay);
      digitalWrite(STEP_X, LOW);
      delayMicroseconds(currentDelay);
      stepX++;
    }

    if (stepY < stepsY && (stepY * maxSteps) / stepsY <= i) {
      digitalWrite(STEP_Y, HIGH);
      delayMicroseconds(currentDelay);
      digitalWrite(STEP_Y, LOW);
      delayMicroseconds(currentDelay);
      stepY++;
    }
  }

  Serial.println(maxSteps);
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
    processGCode(command);
  }
}