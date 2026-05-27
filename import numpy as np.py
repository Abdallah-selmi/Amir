import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq
from scipy.signal import butter, filtfilt  # Ajout pour le filtrage

class SampleAndHoldADC:
    def __init__(self, resolution=12, sample_rate=1000):
        self.resolution = resolution
        self.levels = 2**resolution
        self.sample_rate = sample_rate
        
    def sample_and_hold(self, analog_signal, t):
        """Simule l'échantillonnage et le maintien"""
        sample_times = np.arange(0, t[-1], 1 / self.sample_rate)
        sampled_values = np.interp(sample_times, t, analog_signal)
        held_signal = np.zeros_like(t)
        for i in range(len(sample_times) - 1):
            held_signal[(t >= sample_times[i]) & (t < sample_times[i + 1])] = sampled_values[i]
        held_signal[t >= sample_times[-1]] = sampled_values[-1]
        return held_signal, sampled_values, sample_times
    
    def convert_to_digital(self, analog_signal):
        """Conversion analogique-numérique"""
        normalized = (analog_signal + 1) / 2
        digital = np.round(normalized * (self.levels - 1))
        return np.clip(digital, 0, self.levels - 1)

def low_pass_filter(signal, cutoff, fs, order=5):
    """Filtre passe-bas Butterworth"""
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    return filtfilt(b, a, signal)

def generate_signals(duration=1.0, sample_rate=1000):
    t = np.linspace(0, duration, int(duration * sample_rate))
    sine = np.sin(2 * np.pi * 5 * t)
    noise = np.random.normal(0, 0.2, len(t))
    noisy_sine = sine + noise
    square = np.sign(sine)
    return t, sine, noisy_sine, square

def plot_comparison(t, original, filtered, title):
    """Affiche la comparaison avant/après filtrage"""
    plt.figure(figsize=(10, 6))
    plt.plot(t, original, 'b-', label='Signal original bruité', alpha=0.6)
    plt.plot(t, filtered, 'r-', label='Signal filtré', alpha=0.😎
    plt.title(title)
    plt.xlabel('Temps (s)')
    plt.ylabel('Amplitude')
    plt.grid(True)
    plt.legend()
    plt.show()

# Partie principale modifiée
if _name_ == "_main_":
    # Génération des signaux
    t, sine, noisy_sine, square = generate_signals()
    
    # Configuration ADC
    adc = SampleAndHoldADC(resolution=12, sample_rate=100)
    
    # Conversion du signal bruité
    held_noisy, _, _ = adc.sample_and_hold(noisy_sine, t)
    digital_noisy = adc.convert_to_digital(held_noisy)
    
    # Conversion numérique -> analogique pour visualisation
    reconstructed_noisy = (digital_noisy / (2**12 - 1)) * 2 - 1
    
    # Application du filtre passe-bas
    filtered_digital = low_pass_filter(digital_noisy, cutoff=10, fs=adc.sample_rate)
    reconstructed_filtered = (filtered_digital / (2**12 - 1)) * 2 - 1

    # Calcul des erreurs
    error_noisy = sine - reconstructed_noisy
    error_filtered = sine - reconstructed_filtered
    
    # Affichage des résultats
    plot_comparison(t, reconstructed_noisy, reconstructed_filtered, 
                   "Comparaison avant/après filtrage")
    
    plt.figure(figsize=(10, 4))
    plt.plot(t, error_noisy, 'b-', alpha=0.6, label='Erreur avant filtrage')
    plt.plot(t, error_filtered, 'r-', alpha=0.6, label='Erreur après filtrage')
    plt.title("Évolution de l'erreur de quantification")
    plt.xlabel('Temps (s)')
    plt.ylabel('Erreur')
    plt.grid(True)
    plt.legend()
    plt.show()

    # Analyse fréquentielle
    plot_frequency_response(t, reconstructed_noisy, 100, 'Spectre avant filtrage')
    plot_frequency_response(t, reconstructed_filtered, 100, 'Spectre après filtrage')

    # Calcul RMS
    rms_noisy = np.sqrt(np.mean(error_noisy**2))
    rms_filtered = np.sqrt(np.mean(error_filtered**2))
    print(f"RMS avant filtrage: {rms_noisy:.5f}")
    print(f"RMS après filtrage: {rms_filtered:.5f}")
    print(f"Amélioration: {((rms_noisy - rms_filtered)/rms_noisy * 100):.1f}%")
