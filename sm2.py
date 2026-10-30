def calculate_sm2(quality: int, repetition_count: int, ease_factor: float, interval_days: int):
    if quality < 3:
        repetition_count = 0
        interval_days = 1
    else:
        if repetition_count == 0:
            interval_days = 1
        elif repetition_count == 1:
            interval_days = 6
        else:
            interval_days = round(interval_days * ease_factor)
        repetition_count += 1

    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ease_factor = max(1.3, ease_factor)

    return repetition_count, ease_factor, interval_days    
                             