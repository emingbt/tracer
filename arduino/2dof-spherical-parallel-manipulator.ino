#define STEP_X 2
#define DIR_X 5
#define STEP_Y 3
#define DIR_Y 6

const int stepsPerRevolution = 3200;                      // 1.8° per step with 1/16 microstepping
const float degreesPerStep = 360.0 / stepsPerRevolution;  // Angle per step

// Acceleration parameters
const int MIN_DELAY = 100;   // Minimum delay (maximum speed)
const int MAX_DELAY = 2000;   // Maximum delay (minimum speed)
const int ACCEL_STEPS = 60;  // Number of steps for acceleration/deceleration

// Command buffer settings
const int BUFFER_SIZE = 20;  // Number of commands to buffer
String commandBuffer[BUFFER_SIZE];
int bufferHead = 0;  // Where to write new commands
int bufferTail = 0;  // Where to read commands from
bool isProcessing = false;
int commandsInProcess = 0;  // Track number of commands being processed

void setup() {
  Serial.begin(9600);
  pinMode(STEP_X, OUTPUT);
  pinMode(DIR_X, OUTPUT);
  pinMode(STEP_Y, OUTPUT);
  pinMode(DIR_Y, OUTPUT);

  while (!Serial) {}  // Wait for serial connection (for boards like Leonardo)

  Serial.println("READY");  // Indicate that Arduino is ready
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

  // Send OK after movement is complete
  commandsInProcess--;
  if (commandsInProcess == 0) {
    Serial.println("OK");
  }
}

// Function to add command to buffer
bool addToBuffer(String command) {
  int nextHead = (bufferHead + 1) % BUFFER_SIZE;
  if (nextHead == bufferTail) {
    return false;  // Buffer is full
  }
  commandBuffer[bufferHead] = command;
  bufferHead = nextHead;
  return true;
}

// Function to get next command from buffer
String getNextCommand() {
  if (bufferHead == bufferTail) {
    return "";  // Buffer is empty
  }
  String command = commandBuffer[bufferTail];
  bufferTail = (bufferTail + 1) % BUFFER_SIZE;
  return command;
}

// Function to process G-code
void processGCode(String command) {
  float xTarget = 0, yTarget = 0;

  if (command.startsWith("G1")) {  // Linear move command
    int xIndex = command.indexOf('X');
    int yIndex = command.indexOf('Y');

    if (xIndex != -1) xTarget = command.substring(xIndex + 1).toFloat();
    if (yIndex != -1) yTarget = command.substring(yIndex + 1).toFloat();

    commandsInProcess++;
    moveSteppers(xTarget, yTarget);
  }
}

void loop() {
  // Check for new commands
  while (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (!addToBuffer(command)) {
      Serial.println("BUFFER_FULL");  // Notify if buffer is full
      break;
    }
  }

  // Process commands from buffer if not already processing
  if (!isProcessing && bufferHead != bufferTail) {
    isProcessing = true;
    String command = getNextCommand();
    processGCode(command);
    isProcessing = false;
  }
}
