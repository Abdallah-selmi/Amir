from scipy.signal import butter, filtfilt

def butter_lowpass_filter(data, cutoff, fs, order=5):
    nyquist = 0.5 * fs
    normal_cutoff = cutoff / nyquist
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    y = filtfilt(b, a, data)
    return y
def apply_filter_and_compare(t, analog_signal, noisy_signal, digital_signal, sample_rate, cutoff_freq, resolution):
    # Filtrage du signal analogique bruité
    filtered_analog = butter_lowpass_filter(noisy_signal, cutoff_freq, sample_rate)
    
    # Filtrage du signal numérique converti
    reconstructed_signal = (digital_signal / (2**resolution - 1)) * 2 - 1
    filtered_digital = butter_lowpass_filter(reconstructed_signal, cutoff_freq, sample_rate)
    
    # Calcul des erreurs de quantification
    error_analog, rms_analog = calculate_quantization_error(analog_signal, filtered_analog, 2**resolution)
    error_digital, rms_digital = calculate_quantization_error(analog_signal, filtered_digital, 2**resolution)
    
    # Affichage des résultats
    plt.figure(figsize=(12, 8))
    
    plt.subplot(3, 1, 1)
    plt.plot(t, analog_signal, 'b-', label='Original Analog Signal', alpha=0.7)
    plt.plot(t, filtered_analog, 'g-', label='Filtered Analog Signal', alpha=0.7)
    plt.title('Original vs Filtered Analog Signal')
    plt.xlabel('Time (s)')
    plt.ylabel('Amplitude')
    plt.grid(True)
    plt.legend()
    
    plt.subplot(3, 1, 2)
    plt.plot(t, analog_signal, 'b-', label='Original Analog Signal', alpha=0.7)
    plt.plot(t, filtered_digital, 'r-', label='Filtered Digital Signal', alpha=0.7)
    plt.title('Original vs Filtered Digital Signal')
    plt.xlabel('Time (s)')
    plt.ylabel('Amplitude')
    plt.grid(True)
    plt.legend()
    
    plt.subplot(3, 1, 3)
    plt.plot(t, error_analog, 'g-', label='Quantization Error (Analog Filtered)', alpha=0.7)
    plt.plot(t, error_digital, 'r-', label='Quantization Error (Digital Filtered)', alpha=0.7)
    plt.title('Quantization Error Comparison')
    plt.xlabel('Time (s)')
    plt.ylabel('Error')
    plt.grid(True)
    plt.legend()
    
    plt.tight_layout()
    plt.show()
    
    print(f"RMS Error (Analog Filtered): {rms_analog:.6f}")
    print(f"RMS Error (Digital Filtered): {rms_digital:.6f}")
    if __name__ == "__main__":
    duration = 1.0
    sample_rate = 1000
    t, sine, noisy_sine, square = generate_signals(duration, sample_rate)

    # Analyse de l'effet de la quantification pour différentes résolutions
    resolutions = [8, 10, 12]
    for resolution in resolutions:
        adc = SampleAndHoldADC(resolution=resolution, sample_rate=100)
        held_sine, _, _ = adc.sample_and_hold(sine, t)
        digital_sine = adc.convert_to_digital(held_sine)
        error_sine, rms_sine = calculate_quantization_error(sine, digital_sine, 2**resolution)
        print(f"Resolution: {resolution} bits, Sine Wave RMS Error: {rms_sine:.6f}")
        plot_quantization_error(t, error_sine, f'Quantization Error (Resolution: {resolution} bits)')

    # Simulation de différents taux d'échantillonnage
    sample_rates = [10, 50, 100, 200]
    for rate in sample_rates:
        adc = SampleAndHoldADC(resolution=12, sample_rate=rate)
        held_sine, _, _ = adc.sample_and_hold(sine, t)
        digital_sine = adc.convert_to_digital(held_sine)
        plot_conversion(t, sine, held_sine, digital_sine, f'Sine Wave Conversion (Sample Rate: {rate} Hz)')
        plot_frequency_response(t, held_sine, rate, f'Frequency Response (Sample Rate: {rate} Hz)')

    # Tracer la réponse en fréquence pour un signal échantillonné
    adc = SampleAndHoldADC(resolution=12, sample_rate=100)
    held_sine, _, _ = adc.sample_and_hold(sine, t)
    plot_frequency_response(t, held_sine, 100, 'Frequency Response of Sampled Sine Wave')

    # Application du filtre passe-bas et comparaison des signaux
    cutoff_freq = 10  # Fréquence de coupure du filtre passe-bas
    adc = SampleAndHoldADC(resolution=12, sample_rate=100)
    held_noisy_sine, _, _ = adc.sample_and_hold(noisy_sine, t)
    digital_noisy_sine = adc.convert_to_digital(held_noisy_sine)
    apply_filter_and_compare(t, sine, noisy_sine, digital_noisy_sine, 100, cutoff_freq, 12)