from datetime import datetime

class EnergyOptimizer:
    def __init__(self, base_kwh_hvac=5.0, base_kwh_lighting=1.5):
        self.base_kwh_hvac = base_kwh_hvac
        self.base_kwh_lighting = base_kwh_lighting

    def optimize_settings(self, occupancy_count, current_temp=None, ambient_light=None):
        """
        Determines the best settings for HVAC and Lighting.
        """
        is_occupied = occupancy_count > 0
        
        # Default Logic
        hvac_status = "ON" if is_occupied else "OFF"
        lighting_status = "ON" if is_occupied else "OFF"
        
        # Advanced optimization based on ambient conditions (placeholder)
        if ambient_light and ambient_light > 500: # 500 lux threshold
            lighting_status = "DIMMED" if is_occupied else "OFF"
            
        return {
            "hvac": hvac_status,
            "lighting": lighting_status,
            "expected_consumption": self.calculate_expected_usage(hvac_status, lighting_status)
        }

    def calculate_expected_usage(self, hvac_status, lighting_status):
        usage = 0.0
        if hvac_status == "ON":
            usage += self.base_kwh_hvac
        elif hvac_status == "DIMMED":
            usage += self.base_kwh_hvac * 0.5
            
        if lighting_status == "ON":
            usage += self.base_kwh_lighting
        elif lighting_status == "DIMMED":
            usage += self.base_kwh_lighting * 0.4
            
        return round(usage, 2)

    def calculate_savings(self, hvac_status, lighting_status):
        # Savings compared to baseline (always ON)
        baseline = self.base_kwh_hvac + self.base_kwh_lighting
        current = self.calculate_expected_usage(hvac_status, lighting_status)
        return round(max(0.0, baseline - current), 2)

if __name__ == "__main__":
    optimizer = EnergyOptimizer()
    print(optimizer.optimize_settings(0))
    print(optimizer.optimize_settings(5))
