from sm2 import calculate_sm2


def test_verify_sm2():
    quality = 4
    repetition_count = 2
    ease_factor = 2.5
    interval_days = 3

    new_count, easi, new_interval = calculate_sm2(
        quality, repetition_count, ease_factor, interval_days
    )

    assert new_count == 3
    assert easi == 2.5
    assert new_interval == 8

def test_forgot_cards():
    quality = 1
    repetition_count = 2
    ease_factor = 2.2
    interval_days = 4

    new_count, new_ease, new_interval = calculate_sm2(
        quality, repetition_count, ease_factor, interval_days
    )

    assert new_count == 0
    assert new_interval == 1
