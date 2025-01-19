#include <AccelStepper.h>

// Motor 1 pins
const int dir1Pin = 3;
const int step1Pin = 4;
const int ms1_1 = 6;
const int ms2_1 = 5;

// Motor 2 pins
const int dir2Pin = 8;
const int step2Pin = 9;
const int ms1_2 = 11;
const int ms2_2 = 10;

// Stepper motor parameters
const int stepsPerRevolution = 1600;  // Number of steps per revolution for 1/8 step mode
const int maxAngle = 30;              // Maximum angle in degrees
const int minAngle = -30;             // Minimum angle in degrees

// Initialize the stepper motors
AccelStepper motor1(AccelStepper::DRIVER, step1Pin, dir1Pin);
AccelStepper motor2(AccelStepper::DRIVER, step2Pin, dir2Pin);

void setup() {
  pinMode(ms1_1, OUTPUT);
  pinMode(ms2_1, OUTPUT);
  pinMode(ms1_2, OUTPUT);
  pinMode(ms2_2, OUTPUT);

  // Set motors to 1/8-step
  digitalWrite(ms1_1, HIGH);
  digitalWrite(ms2_1, HIGH);
  digitalWrite(ms1_2, HIGH);
  digitalWrite(ms2_2, HIGH);

  // Initialize motors
  motor1.setMaxSpeed(2000);
  motor1.setAcceleration(1200);
  motor2.setMaxSpeed(2000);
  motor2.setAcceleration(1200);

  // Move motors to the center at the start
  moveToCenter();
}

void loop() {
  // Perform circle movement
  moveToCenter();       // Start from the center
  moveCircle(5, 100);   // Circle with radius 5 degrees and 100 steps
  moveToCenter();       // Return to the center
  moveCircle(10, 100);  // Circle with radius 10 degrees and 100 steps
  moveToCenter();       // Return to the center
  moveCircle(15, 100);  // Circle with radius 15 degrees and 100 steps
  moveCircle(15, 12);   // Circle with radius 15 degrees and 12 steps
  moveCircle(15, 4);    // Circle with radius 15 degrees and 4 steps
  delay(1000);

  // Perform square movement
  moveToCenter();  // Start from the center
  moveSquare(20);  // Square with side length 20 degrees
  moveToCenter();  // Return to the center
  delay(1000);

  // Perform triangle movement
  moveToCenter();    // Start from the center
  moveTriangle(20);  // Triangle with side length 20 degrees
  moveToCenter();    // Return to the center
  delay(1000);
}

// Function to move both motors simultaneously to their target angles
void moveToAngles(AccelStepper &motor1, AccelStepper &motor2, float motor1TargetAngle, float motor2TargetAngle) {
  // Convert target angles to steps
  int motor1TargetSteps = motor1TargetAngle * (stepsPerRevolution / 360.0);
  int motor2TargetSteps = motor2TargetAngle * (stepsPerRevolution / 360.0);

  // Set target positions
  motor1.moveTo(motor1TargetSteps);
  motor2.moveTo(motor2TargetSteps);

  // Move motors simultaneously
  while (motor1.distanceToGo() != 0 || motor2.distanceToGo() != 0) {
    motor1.run();
    motor2.run();
  }
}

// Function to move both motors to the center (0 degrees)
void moveToCenter() {
  moveToAngles(motor1, motor2, 0, 0);
}

// Smooth circle movement
void moveCircle(float radius, int steps) {
  for (int i = 0; i <= steps; i++) {
    float angle = i * (360.0 / steps);  // Angle in degrees
    float motor1TargetAngle = radius * cos(radians(angle));
    float motor2TargetAngle = radius * sin(radians(angle));

    // Ensure target angles are within limits
    motor1TargetAngle = constrain(motor1TargetAngle, minAngle, maxAngle);
    motor2TargetAngle = constrain(motor2TargetAngle, minAngle, maxAngle);

    moveToAngles(motor1, motor2, motor1TargetAngle, motor2TargetAngle);
  }
}

// Smooth square movement
void moveSquare(float side_length) {
  float points[5][2] = {
    { side_length, side_length },
    { -side_length, side_length },
    { -side_length, -side_length },
    { side_length, -side_length },
    { side_length, side_length }
  };

  for (int i = 0; i < 5; i++) {
    float motor1TargetAngle = constrain(points[i][0], minAngle, maxAngle);
    float motor2TargetAngle = constrain(points[i][1], minAngle, maxAngle);

    moveToAngles(motor1, motor2, motor1TargetAngle, motor2TargetAngle);
  }
}

// Smooth triangle movement
void moveTriangle(float side_length) {
  float points[4][2] = {
    { 0, side_length },
    { -side_length, -side_length },
    { side_length, -side_length },
    { 0, side_length }
  };

  for (int i = 0; i < 4; i++) {
    float motor1TargetAngle = constrain(points[i][0], minAngle, maxAngle);
    float motor2TargetAngle = constrain(points[i][1], minAngle, maxAngle);

    moveToAngles(motor1, motor2, motor1TargetAngle, motor2TargetAngle);
  }
}
