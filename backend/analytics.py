from typing import List
import datetime

class AnalyticsEngine:
    def __init__(self):
        self.history = []

    def log_event(self, classroom_id: str, occupancy: int, consumption: float):
        self.history.append({
            "timestamp": datetime.datetime.now(),
            "classroom_id": classroom_id,
            "occupancy": occupancy,
            "consumption": consumption
        })

    def predict_next_hour_usage(self) -> float:
        """
        Simple moving average prediction.
        """
        if not self.history:
            return 0.0
        
        recent = self.history[-10:]
        avg = sum(h["consumption"] for h in recent) / len(recent)
        return avg * 1.1 # simple factor

    def check_anomalies(self) -> List[str]:
        """
        Checks for unusual energy spikes.
        """
        alerts = []
        if len(self.history) < 2:
            return []
            
        last = self.history[-1]
        prev = self.history[-2]
        
        if last["consumption"] > prev["consumption"] * 2 and last["occupancy"] == prev["occupancy"]:
            alerts.append(f"Anomaly detected in {last['classroom_id']}: High consumption without occupancy change.")
            
        return alerts

analytics = AnalyticsEngine()
