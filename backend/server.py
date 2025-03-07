# Required libraries
import face_recognition
import cv2
import numpy as np
import pickle
import os
from datetime import datetime

class FaceRecognitionService:
    def __init__(self, known_faces_path="known_faces.pkl"):
        """
        Initialize face recognition service

        Args:
            known_faces_path: Path to pickled file containing known face encodings
        """
        self.known_faces_path = known_faces_path
        self.known_face_encodings = []
        self.known_face_names = []
        self.load_known_faces()

    def load_known_faces(self):
        """Load known faces from pickle file if it exists"""
        if os.path.exists(self.known_faces_path):
            with open(self.known_faces_path, 'rb') as f:
                data = pickle.load(f)
                self.known_face_encodings = data['encodings']
                self.known_face_names = data['names']
                print(f"Loaded {len(self.known_face_encodings)} known faces")

    def save_known_faces(self):
        """Save known faces to pickle file"""
        with open(self.known_faces_path, 'wb') as f:
            data = {
                'encodings': self.known_face_encodings,
                'names': self.known_face_names
            }
            pickle.dump(data, f)

    def register_face(self, image, student_id):
        """
        Register a new face

        Args:
            image: Image containing face (numpy array)
            student_id: Unique identifier for the student

        Returns:
            bool: True if registration was successful, False otherwise
        """
        # Convert BGR image (from OpenCV) to RGB (face_recognition format)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Find all faces in the image
        face_locations = face_recognition.face_locations(rgb_image)

        if len(face_locations) != 1:
            return False, "Error: Image must contain exactly one face"

        # Compute face encoding
        face_encoding = face_recognition.face_encodings(rgb_image, face_locations)[0]

        # Check if this face is already registered
        if len(self.known_face_encodings) > 0:
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
            if True in matches:
                return False, "Error: This face is already registered"

        # Add face to known faces
        self.known_face_encodings.append(face_encoding)
        self.known_face_names.append(student_id)

        # Save updated known faces
        self.save_known_faces()

        return True, "Registration successful"

    def recognize_face(self, image):
        """
        Recognize a face in an image

        Args:
            image: Image containing face to recognize

        Returns:
            student_id or None if no match is found
        """
        # Convert BGR image to RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Find all faces in the image
        face_locations = face_recognition.face_locations(rgb_image)

        if len(face_locations) != 1:
            return None, "Error: Image must contain exactly one face"

        # Compute face encoding
        face_encoding = face_recognition.face_encodings(rgb_image, face_locations)[0]

        # Check for matches
        if len(self.known_face_encodings) > 0:
            # Compare face to known faces
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=0.6)

            # Calculate face distances
            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)

            if True in matches:
                best_match_index = np.argmin(face_distances)
                student_id = self.known_face_names[best_match_index]
                confidence = 1 - face_distances[best_match_index]
                return student_id, confidence

        return None, "No match found"

# Example usage:
# fr_service = FaceRecognitionService()
# success, message = fr_service.register_face(image, "student123")
# student_id, confidence = fr_service.recognize_face(image)