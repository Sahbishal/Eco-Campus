import cv2
import numpy as np

class OccupancyDetector:
    def __init__(self):
        # Initialize the HOG person detector
        self.hog = cv2.HOGDescriptor()
        self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

    def detect_people(self, frame):
        """
        Detects people in a given frame and returns the count.
        """
        # Resize frame for faster processing
        frame = cv2.resize(frame, (640, 480))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect people in the image
        # returns the bounding boxes for the detected objects
        boxes, weights = self.hog.detectMultiScale(gray, winStride=(8, 8), padding=(8, 8), scale=1.05)
        
        return len(boxes)

    def process_stream(self, video_source=0):
        """
        Processes a video stream and yields occupancy counts.
        """
        cap = cv2.VideoCapture(video_source)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            count = self.detect_people(frame)
            yield count
            
        cap.release()

if __name__ == "__main__":
    detector = OccupancyDetector()
    print("Starting detector (mock or camera)...")
    # For testing, we can use a placeholder or camera
    # count = detector.detect_people(some_image)
