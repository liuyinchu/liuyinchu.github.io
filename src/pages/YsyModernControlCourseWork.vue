<template>
  <div class="colabm-container" ref="containerRef" @mousemove="handleMouseMove">
    <canvas ref="canvasRef" class="neural-canvas"></canvas>

    <div class="colabm-layout">
      <aside class="colabm-sidebar">
        <div class="sidebar-header">
          <div class="logo-text">CoLabM</div>
          <div class="subtitle">MIMO Control Lab</div>
        </div>
        <nav>
          <ul>
            <li v-for="(item, index) in navItems" :key="index" 
                :class="{ active: activeSection === item.id }" 
                @click="scrollTo(item.id)">
              <span class="num">{{ item.num }}</span> {{ item.label }}
            </li>
          </ul>
        </nav>
        <div class="sidebar-footer">
          <p>Running on Neural Core</p>
        </div>
      </aside>

      <main class="colabm-main" @scroll="onScroll">
        <div v-if="loading" class="loading-mask">
          <div class="loader-spinner"></div>
          <span>Initializing Simulation Environment...</span>
        </div>

        <div class="content-wrapper" :class="{ 'fade-in': !loading }">
          
          <header class="doc-header">
            <h1>CoLabM</h1>
            <p class="doc-subtitle"><strong>C</strong>ontrol-<strong>o</strong>riented <strong>Lab</strong>oratory for active isolation in <strong>M</strong>IMO systems</p>
            <div class="doc-meta">
              <span class="tag">Modern Control</span>
              <span class="tag">Active Vibration Isolation</span>
              <span class="tag">Course Work</span>
            </div>
            <div class="intro-card spotlight-card">
              <p>The following materials constitute the open-source content accompanying the final project of the course <em>Modern Control Theory and Technology</em>. They mainly include:</p>
              <ol class="intro-list">
                <li>Background of the final project</li>
                <li>Interpretation of the project objectives and requirements</li>
                <li>Construction of the Simulink simulation model</li>
                <li>Design rationale of the LQG controller</li>
                <li>Performance metrics and data processing</li>
              </ol>
             </div>
          </header>

          <section id="section-1" class="doc-section spotlight-card">
            <div class="section-header-row">
              <h2>1. Background of the Final Project</h2>
              <a :href="attachmentLinks['section-1']" class="attach-btn" target="_blank" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <span>Attachment</span>
              </a>
            </div>
            
            <p>
              The ground simulation system of the TianQin Project is designed to validate drag-free control technologies, one of whose core requirements is the effective isolation of ground-induced vibrations. However, purely passive vibration isolation devices exhibit limited attenuation capability in the low-frequency range and are therefore insufficient to meet the stringent disturbance suppression requirements of high-precision ground-based simulation experiments. Consequently, it becomes necessary to introduce active control strategies on top of passive isolation in order to enhance the overall vibration isolation performance.
            </p>
            <p>
              The controlled plant investigated in this course project is a compact three-degree-of-freedom active vibration isolation platform, as illustrated in the figure.
            </p>

            <!-- <div class="img-placeholder">
              <div class="img-content">
                <div class="img-icon">🖼️</div>
                <span>[Figure 1: Compact 3-DOF Active Vibration Isolation Platform]</span>
                <small>Drag and drop image here or click to browse</small>
              </div>
            </div> -->
            <figure class="doc-figure spotlight-card">
              <img src="/fig/diagram_of_the_controlled_object.jpg" />
              <figcaption>Figure 1: Compact 3-DOF Active Vibration Isolation Platform</figcaption>
            </figure>

            <p>
              Two inertial sensors are installed at the center of the platform to measure velocity signals in the horizontal and vertical directions, providing essential state-related information for active control. In addition, the platform is equipped with three voice coil actuators: one actuator is responsible for horizontal motion control, while the remaining two form a dual-actuator configuration for the vertical direction, enabling independent control of the vertical degree of freedom. This sensor–actuator architecture constitutes a typical multi-input multi-output (MIMO) active vibration isolation system, which provides a concrete physical basis for subsequent controller design, controllability and observability analysis, state estimation, and the development of Kalman filtering techniques.
            </p>
          </section>

          <section id="section-2" class="doc-section spotlight-card">
            <div class="section-header-row">
              <h2>2. Interpretation of the Project Objectives and Requirements</h2>
              <a :href="attachmentLinks['section-2']" class="attach-btn" target="_blank" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <span>Attachment</span>
              </a>
            </div>

            <p>
              As a representative MIMO mechanical system, the active vibration isolation platform poses multiple challenges in both modeling and control design. First, due to its structural characteristics, significant coupling exists among the horizontal, vertical, and in-plane rotational degrees of freedom. As a result, conventional single-input single-output (SISO) control strategies based on independent channels are generally inadequate for suppressing cross-axis interactions. Second, the platform relies solely on inertial sensors that provide velocity measurements, rendering certain displacement variables and internal states unmeasurable. This limitation not only constrains the achievable performance of output-feedback controllers but also imposes higher demands on state estimation and noise modeling. Furthermore, the bandwidth, noise characteristics, and saturation limits of the voice coil actuator drivers introduce inherent trade-offs between low-frequency vibration isolation and high-frequency noise suppression, making it more challenging to achieve high-performance closed-loop responses while maintaining sufficient stability margins.
            </p>
            <p>
              On the other hand, the project materials provide a linearized state-space model of the platform, which establishes a clear mathematical foundation for subsequent control design. The system comprises three degrees of freedom—horizontal, vertical, and in-plane rotation—and, with an appropriate choice of state variables, can be represented by a ten-dimensional state vector. The corresponding state-space equations are given by
            </p>
            
            <div class="math-block" data-tex="\dot{x} = A x + B u, \quad y = C x + D u."></div>

            <p>
              Here, the matrix <span class="math-inline" data-tex="A \in \mathbb{R}^{10 \times 10}"></span> describes the linearly coupled dynamics among displacements and velocities along the three axes. The input matrix <span class="math-inline" data-tex="B \in \mathbb{R}^{10 \times 5}"></span> corresponds to five inputs, including three control force inputs generated by the voice coil actuators <span class="math-inline" data-tex="(u_1, u_2, u_3)"></span>, which actuate the horizontal and two vertical directions, as well as two disturbance inputs <span class="math-inline" data-tex="(\lambda u_4, \lambda u_5)"></span> representing vertical and horizontal ground displacement excitations. The output matrix <span class="math-inline" data-tex="C \in \mathbb{R}^{4 \times 10}"></span> maps the system states to four measured velocity outputs <span class="math-inline" data-tex="(y_1, \ldots, y_4)"></span>, obtained from the inertial sensors located at the left vertical, right vertical, left horizontal, and right horizontal positions. The direct transmission matrix <span class="math-inline" data-tex="D"></span> is zero, indicating the absence of direct feedthrough from inputs to outputs. Accordingly, the platform can be regarded as a MIMO system with three control inputs, two disturbance inputs, and four measurement outputs. All subsequent controller designs, controllability and observability analyses, state estimation procedures, and Kalman filter implementations are developed on the basis of this model.
            </p>
            <p>
              Within this modeling framework, the objectives of the course project can be summarized at four progressive levels. First, classical decoupling controllers are to be designed based on the given state-space model and channel structure, followed by an analysis of their performance and limitations in the absence of state estimation. Second, the controllability and observability of the system are to be systematically examined, and state-feedback control laws and state observers are to be constructed in order to assess the impact of unobservable states on closed-loop performance. Third, a Kalman filter is to be independently derived and implemented to obtain optimal linear unbiased state estimates under noisy measurement conditions. Fourth, a multivariable MIMO controller is to be designed for the three-input, four-output system and quantitatively compared with the control strategies developed in the previous stages, thereby enabling a systematic evaluation of the advantages and applicability of modern control methods in active vibration isolation problems.
            </p>
            <p>
              In the first stage of the project, a “classical decoupling controller” is designed based on the provided linearized model, and its closed-loop performance is validated. Taking advantage of the high degree of structural symmetry of the platform, as well as the paired arrangement of inertial sensors and vertical actuators, a design strategy combining physical symmetric/antisymmetric coordinate transformations with numerical optimization is adopted. This approach first transforms the original MIMO system into a set of virtual channels with clearer physical interpretations and significantly reduced coupling. Classical SISO controllers are then designed independently for these virtual channels. Compared with strict diagonalization of the full transfer matrix, this method avoids excessive implementation complexity and better satisfies practical engineering requirements in terms of interpretability and realizability. Externally, the resulting decoupling controller behaves as a three-input, four-output MIMO control law, while internally it consists of several nearly independent SISO control loops, providing a classical benchmark for subsequent state-space and MIMO controller designs.
            </p>
            <p>
              In active vibration isolation systems, accurate knowledge of the platform’s dynamic states is a prerequisite for achieving high-performance feedback control. In practice, however, sensor measurements are inevitably corrupted by noise, and not all system states are directly accessible. Consequently, relying solely on raw sensor outputs is insufficient to meet the control system’s demand for high-quality state information. It is therefore essential to construct a filter capable of providing optimal linear state estimates in noisy environments.
            </p>
            <p>
              Accordingly, this project derives and implements a Kalman filter based on the stochastic dynamic model of the system. Starting from noise-driven continuous-time stochastic systems, the theoretical foundation of optimal filtering is established. The recursive algorithm of the discrete-time Kalman filter is then presented, with explicit prediction and update steps suitable for practical implementation. Finally, the filter is integrated with the active vibration isolation platform model to provide a reliable and high-accuracy state estimation mechanism for subsequent MIMO controller design. As a key component of the Linear Quadratic Gaussian (LQG) control framework, the Kalman filter plays a critical role in ensuring system stability and enhancing vibration isolation performance.
            </p>
            <p>
              Within the linear multivariable control framework, the Linear Quadratic Gaussian (LQG) approach offers a systematic and rigorous design methodology for optimal control of noisy dynamic systems. By combining an optimal state-feedback controller (LQR) with an optimal state estimator (LQE, namely the Kalman filter), LQG control addresses situations in which system states are not fully measurable and the dynamics are subject to stochastic disturbances. For MIMO systems such as the active vibration isolation platform considered in this project, the LQG method is particularly well suited to handling coupled dynamics, measurement noise, and uncertainties, and therefore represents a natural choice for the synthesis of high-performance controllers.
            </p>
          </section>

          <section id="section-3" class="doc-section spotlight-card">
            <div class="section-header-row">
              <h2>3. Construction of the Simulink Simulation Model</h2>
              <a :href="attachmentLinks['section-3']" class="attach-btn" target="_blank" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <span>Attachment</span>
              </a>
            </div>
            
            <p>
              Based on the given linearized state-space representation, a comprehensive Simulink simulation model of the active vibration isolation system is constructed to evaluate the closed-loop performance of different control strategies under disturbance and noise conditions. The overall model adopts a modular architecture, consisting of the controlled plant, ground disturbance models, sensor noise models, signal conditioning blocks, and controller subsystems, which facilitates systematic analysis and future extensions.
            </p>

            <h3>3.1 Loading of the Original System and Channel Decomposition</h3>
            <p>
              The simulation starts by loading the continuous-time linearized model from the data file <code>Original+model.mat</code>. The state-space matrices <span class="math-inline" data-tex="A, B, C, D"></span> describe a three-degree-of-freedom active vibration isolation platform with a ten-dimensional state vector. According to the physical interpretation of the inputs, the input matrix <span class="math-inline" data-tex="B"></span> is decomposed into control and disturbance channels: the first three inputs correspond to the control forces generated by the voice coil actuators, while the remaining two inputs represent ground displacement disturbances in the horizontal and vertical directions. The output matrix <span class="math-inline" data-tex="C"></span> maps the system states to four velocity measurements provided by the inertial sensors.
            </p>
            <p>
              In Simulink, the controlled plant is implemented using a continuous-time State-Space block. Control inputs and disturbance inputs are injected through separate signal paths, allowing a clear structural separation between control actions and external excitations.
            </p>

            <h3>3.2 Modeling of Ground Disturbances</h3>
            <p>
              To characterize the influence of ground-induced vibrations, a ground disturbance model based on zero–pole dynamics is incorporated into the simulation. The disturbance dynamics employ complex-conjugate zeros and multiple poles to reproduce the dominant low-frequency spectral characteristics of realistic ground motion. The overall gain is normalized according to physical scaling considerations.
            </p>
            <p>
              Both ground displacement and its rate-related effects are modeled by constructing corresponding zero–pole systems and converting them into state-space form. These disturbance signals are then injected into the disturbance input channels of the controlled plant, ensuring that the system operates under continuous external excitation during simulation and enabling a realistic assessment of vibration isolation performance.
            </p>

            <h3>3.3 Sensor Noise Modeling and Signal Conditioning</h3>
            <p>
              To account for measurement imperfections, sensor noise subsystems are introduced to emulate the noise characteristics of inertial sensors. The sensor noise is modeled using a continuous-time zero–pole representation, with parameters selected according to the specified noise spectral density level and scaled to reflect ultra-low-noise measurement conditions.
            </p>
            <p>
              In the Simulink implementation, the noise signals are superimposed on the true system outputs. The resulting signals are then passed through analog-to-digital conversion (ADC) and signal conditioning blocks to produce discrete-time measurement signals, which serve as inputs to output-feedback or state-estimation-based controllers.
            </p>

            <h3>3.4 Controller Integration and Overall Simulation Framework</h3>
            <p>
              On top of the plant, disturbance, and noise models, the controller is implemented as an independent subsystem within the Simulink framework. This structure allows flexible switching among classical decoupling control, state-feedback control, and LQG control schemes. A uniform sampling frequency of <span class="math-inline" data-tex="f_s = 10\text{kHz}"></span>, corresponding to a sampling period of <span class="math-inline" data-tex="T_s = 0.1\text{ms}"></span>, is adopted throughout the simulation to ensure accurate representation of high-frequency dynamics and noise effects.
            </p>
            <p>
              The resulting Simulink model provides a unified and reliable numerical platform for systematically analyzing open-loop and closed-loop system responses, vibration isolation performance, and noise suppression capabilities under different control strategies.
            </p>
          </section>

          <section id="section-4" class="doc-section spotlight-card">
            <div class="section-header-row">
              <h2>4. Design Rationale of the LQG Controller</h2>
              <a :href="attachmentLinks['section-4']" class="attach-btn" target="_blank" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <span>Attachment</span>
              </a>
            </div>
            
            <p>
              The Linear Quadratic Gaussian (LQG) control framework integrates optimal control and optimal estimation theories into a unified design methodology, making it particularly suitable for linear systems whose states are not fully measurable and are subject to stochastic disturbances and measurement noise. In this project, LQG control is adopted to address the high-performance control requirements of an active vibration isolation platform, which represents a typical multi-input multi-output (MIMO) system operating in a noisy environment.
            </p>

            <h3>4.1 LQR State Feedback Control Law</h3>
            <p>
              Starting from optimal control theory, a quadratic performance index is formulated for the given linear system, leading to the design of a Linear Quadratic Regulator (LQR). By solving the associated algebraic Riccati equation, the optimal state feedback gain matrix (K) is obtained, yielding the control law
            </p>
            <div class="math-block" data-tex="u(t) = -K x(t)."></div>
            <p>
              This control law guarantees both asymptotic stability and optimal energy performance of the closed-loop system in the quadratic cost sense. For general MIMO systems, the LQR gain matrix <span class="math-inline" data-tex="K"></span> explicitly captures the internal coupling among system states and control channels, enabling coordinated control across different inputs and achieving global optimality.
            </p>

            <h3>4.2 Kalman Filtering and Optimal State Estimation</h3>
            <p>
              In practical applications, however, the full system state is rarely available for direct measurement, and relying solely on sensor outputs is insufficient to meet the information requirements of state feedback control. To overcome this limitation, an optimal state estimator, namely the Linear Quadratic Estimator (LQE), is constructed. In both continuous-time and discrete-time settings, the LQE corresponds to the Kalman filter.
            </p>
            <p>
              When the noise covariance matrices <span class="math-inline" data-tex="Q"></span> and <span class="math-inline" data-tex="R"></span>, as well as the system matrices <span class="math-inline" data-tex="A"></span> and <span class="math-inline" data-tex="C"></span>, are time-invariant, and appropriate detectability and stability conditions are satisfied, the estimation error covariance matrix <span class="math-inline" data-tex="P(t)"></span> converges to a unique steady-state solution <span class="math-inline" data-tex="P_\infty"></span>. This steady-state covariance satisfies the algebraic Riccati equation
            </p>
            <div class="math-block" data-tex="A P_\infty + P_\infty A^\mathrm{T} - P_\infty C^\mathrm{T} R^{-1} C P_\infty + Q = 0."></div>
            <p>
              The corresponding steady-state Kalman gain is given by
            </p>
            <div class="math-block" data-tex="J_s^\infty = P_\infty C^\mathrm{T} R^{-1},"></div>
            <p>
              which leads to a linear observer with constant gain. This estimator is optimal in the mean-square error sense and, owing to its constant-gain structure, significantly reduces implementation complexity and real-time computational burden. These features make it particularly suitable for active vibration isolation systems that require high-speed state reconstruction.
            </p>

            <h3>4.3 LQG Controller Structure and Separation Principle</h3>
            <p>
              The key idea of LQG control lies in the series connection of optimal state estimation and optimal state feedback control. The Kalman filter provides an optimal estimate <span class="math-inline" data-tex="\hat{x}(t)"></span> of the system state under noisy measurements, which is then used by the LQR controller in place of the true state to compute the control input, resulting in
            </p>
            <div class="math-block" data-tex="u(t) = -K \hat{x}(t)."></div>
            <p>
              Under standard assumptions, the LQG controller satisfies the separation principle, which states that the estimator and the controller can be designed independently, while the resulting closed-loop system remains optimal in a statistical sense. This property greatly simplifies the controller design procedure and enhances its practical applicability to MIMO systems characterized by noise disturbances, incomplete information, and strong dynamic coupling.
            </p>
            <p>
              In summary, the LQG-based MIMO control strategy leverages LQR to optimize control performance and employs steady-state Kalman filtering to achieve reliable state estimation. By combining optimality, robustness to noise, and implementation efficiency, the LQG framework provides a high-performance control solution well suited for active vibration isolation applications.
            </p>
          </section>

          <section id="section-5" class="doc-section spotlight-card">
            <div class="section-header-row">
              <h2>5. Performance Metrics and Data Processing</h2>
              <a :href="attachmentLinks['section-5']" class="attach-btn" target="_blank" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <span>Attachment</span>
              </a>
            </div>
            
            <p>
              To quantitatively evaluate the vibration isolation performance of different control strategies, the power spectral density (PSD) is adopted as the primary performance metric in this project. PSD provides a frequency-domain description of how signal energy is distributed over frequency and is widely used to assess vibration suppression, resonance attenuation, and noise propagation characteristics in isolation systems.
            </p>

            <h3>5.1 PSD Estimation Method and Implementation</h3>
            <p>
              In the data processing stage, the sampling parameters are first determined from the simulated time series. The sampling frequency <span class="math-inline" data-tex="f_s"></span> is obtained from the time step, and a target frequency resolution <span class="math-inline" data-tex="\Delta f"></span> is specified to define the effective analysis duration <span class="math-inline" data-tex="T_{\mathrm{eff}} = 1 / \Delta f"></span>. This leads to a segment length <span class="math-inline" data-tex="M = f_s T_{\mathrm{eff}}"></span> for the Welch method. Such a configuration ensures adequate low-frequency resolution while reducing the variance of the spectral estimate.
            </p>
            <p>
              PSD estimation is performed using the Welch averaged periodogram method for system output signals under different control strategies. In particular, velocity outputs in the vertical and horizontal directions on both sides of the platform are processed independently. The resulting PSD curves are plotted on logarithmic axes, enabling direct comparison across multiple decades of frequency.
            </p>

            <div class="code-window">
              <div class="window-header">
                <div class="dots">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <span class="file-name">psd_plotting.py</span>
              </div>
              <div class="code-content">
                <pre><code class="language-python">import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import welch
import pandas as pd

# ===============================
# Read-data example: ADC noise
# ===============================
data = pd.read_csv('ns.csv')
ns = data['ns'].values

# ===============================
# Sampling parameters
# ===============================
Ts = np.mean(np.diff(t))      # time step
fs = 1.0 / dt                 # sampling frequency
T = t[-1] - t[0]              # total duration
L = len(t)

# Frequency resolution setting
Delta_f = 0.01                # target frequency resolution [Hz]
T_eff = 1.0 / Delta_f         # effective time length
M = int(fs * T_eff)           # segment length for Welch

print('Welch segment length M:', M)
print('Number of averages L/M:', L / M)

# ===============================
# ASD computation
# ===============================

def fast_d_asd(data: ndarray, fs: float=fs, M: int=M, Delta_f: float=Delta_f, f_max: float=1000.0) -> tuple(ndarray, ndarray):
    '''
    fastly caculate the displacement asd with welch method.
    '''
    f, pxx = welch(data, fs=fs, nperseg=M)
    mask = (f > Delta_f) & (f < f_max) 
    # mask = (f > Delta_f)
    d_asd = np.sqrt(pxx[mask]) / (2 * np.pi * f[mask])
    return f[mask], d_asd

# Example: ADC noise
f, d_asd_ns = fast_d_asd(ns)

# ===============================
# Plotting
# ===============================
plt.figure(figsize=(7, 5))

plt.loglog(f, d_asd_ns,  label='Noise Floor', linewidth=1.8)

plt.xlabel('Frequency [Unit]')
plt.ylabel('ASD [Unit]')
plt.title('ASD of ADC Noise')
plt.legend()
plt.grid(True, which='both', ls='--', alpha=0.5)
plt.tight_layout()

plt.savefig('asd_ns.pdf')
plt.show()</code></pre>
              </div>
            </div>

            <figure class="doc-figure spotlight-card">
              <img src="/fig/asd_example.png" />
              <figcaption>Figure 2: PSD Comparison Plot (Generated Data)</figcaption>
            </figure>

            <h3>5.2 Additional Metrics (To Be Added)</h3>
            <p>(Content to be populated)</p>
          </section>

          <footer class="doc-footer">
            <p>&copy; 2025 CoLabM Project. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const activeSection = ref('section-1');
const containerRef = ref(null);
const canvasRef = ref(null);
const loading = ref(true);

const navItems = [
  { id: 'section-1', num: '01', label: 'Background' },
  { id: 'section-2', num: '02', label: 'Objectives' },
  { id: 'section-3', num: '03', label: 'Simulation' },
  { id: 'section-4', num: '04', label: 'LQG Design' },
  { id: 'section-5', num: '05', label: 'Metrics' },
];

// --- 资源加载逻辑 ---
const loadResource = (type, url) => {
  return new Promise((resolve, reject) => {
    let el;
    if (type === 'style') {
      if (document.querySelector(`link[href="${url}"]`)) return resolve();
      el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = url;
    } else {
      if (document.querySelector(`script[src="${url}"]`)) return resolve();
      el = document.createElement('script');
      el.src = url;
    }
    el.onload = resolve;
    el.onerror = reject;
    document.head.appendChild(el);
  });
};

// --- Spotlight 逻辑 ---
const handleMouseMove = (e) => {
  const container = containerRef.value;
  if (!container) return;
  const cards = container.querySelectorAll('.spotlight-card');
  
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
};

// --- 附件点击逻辑 ---
const handleAttachment = (sectionId) => {
  alert(`Open attachment dialog for ${sectionId}`);
};

// --- 滚动监听 ---
const scrollTo = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    activeSection.value = id;
  }
};

const onScroll = (e) => {
  const scrollPos = e.target.scrollTop + 200;
  for (const item of navItems) {
    const el = document.getElementById(item.id);
    if (el) {
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        activeSection.value = item.id;
      }
    }
  }
};

// --- 神经粒子 Canvas 动画 ---
let animationFrameId;
const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let width, height;
  
  const resize = () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  const particleCount = 80; // 粒子数量
  const connectionDistance = 150;
  const mouseDistance = 200;

  // 鼠标位置
  const mouse = { x: null, y: null };
  containerRef.value.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  containerRef.value.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // 边界反弹
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // 鼠标排斥互动
      if (mouse.x != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouseDistance) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouseDistance - distance) / mouseDistance;
          const directionX = forceDirectionX * force * 2;
          const directionY = forceDirectionY * force * 2;
          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }

    draw() {
      ctx.fillStyle = 'rgba(37, 99, 235, 0.5)'; // 科研蓝粒子
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // 连线
      for (let j = i; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(37, 99, 235, ${1 - distance / connectionDistance})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();
};

onMounted(async () => {
  try {
    // 启动背景特效
    initCanvas();

    // 并行加载 KaTeX 和 Highlight.js
    await Promise.all([
      loadResource('style', 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'),
      loadResource('script', 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js'),
      loadResource('style', 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css'),
      loadResource('script', 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'),
      loadResource('script', 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/python.min.js')
    ]);

    await nextTick();

    // 渲染数学公式
    const mathBlocks = containerRef.value.querySelectorAll('.math-block');
    mathBlocks.forEach(el => {
      if (window.katex) window.katex.render(el.getAttribute('data-tex'), el, { displayMode: true, throwOnError: false });
    });
    const mathInlines = containerRef.value.querySelectorAll('.math-inline');
    mathInlines.forEach(el => {
      if (window.katex) window.katex.render(el.getAttribute('data-tex'), el, { displayMode: false, throwOnError: false });
    });

    // 渲染代码高亮
    const codeBlocks = containerRef.value.querySelectorAll('pre code');
    codeBlocks.forEach(el => {
      if (window.hljs) window.hljs.highlightElement(el);
    });

  } catch (error) {
    console.error("CoLabM Assets Loading Failed:", error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', initCanvas);
});

const attachmentLinks = {
  'section-1': 'https://github.com/pifuyuini/un-official-sysuspa-modern-control-course-work/tree/main/additional-result/matlab-proj',  // 替换为您实际的文件路径
  'section-2': 'https://github.com/pifuyuini/un-official-sysuspa-modern-control-course-work/tree/main/old-result/matlab-proj',
  'section-3': 'https://github.com/pifuyuini/un-official-sysuspa-modern-control-course-work/blob/main/old-result/appendix/siso_lqg_design.pdf',
  'section-4': 'https://github.com/pifuyuini/un-official-sysuspa-modern-control-course-work/tree/main/additional-result/lqg-attachment',
  'section-5': 'https://github.com/pifuyuini/un-official-sysuspa-modern-control-course-work/tree/main/additional-result/python-data-analysis'
};

</script>

<style scoped>
/* 完全局域化样式空间 
  前缀 .colabm-container 保证不污染外部
*/
.colabm-container {
  /* 定义 CSS 变量 */
  --co-bg: #f3f4f6;
  --co-sidebar-bg: #111827; /* 深色侧边栏 */
  --co-text-main: #1f2937;
  --co-text-light: #6b7280;
  --co-primary: #3b82f6; /* 核心蓝 */
  --co-primary-glow: rgba(59, 130, 246, 0.5);
  --co-border: rgba(229, 231, 235, 0.5);
  --co-card-bg: rgba(255, 255, 255, 0.7); /* 玻璃拟态背景 */
  --co-font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --co-font-mono: "JetBrains Mono", monospace;
  
  font-family: var(--co-font-sans);
  color: var(--co-text-main);
  background-color: var(--co-bg);
  line-height: 1.7;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  font-size: 16px;
}

.colabm-container *, 
.colabm-container *::before, 
.colabm-container *::after {
  box-sizing: border-box;
}

/* 1. Canvas 背景 */
.neural-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* 最底层 */
  pointer-events: none; /* 让鼠标事件穿透给下层 DOM */
}

/* 2. Loading */
.loading-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--co-bg);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  z-index: 100;
  color: var(--co-primary);
  font-weight: 600;
}
.loader-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: var(--co-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 3. 布局 */
.colabm-layout {
  display: flex;
  height: 100%;
  position: relative;
  z-index: 2; /* 内容层级高于 canvas */
}

/* Sidebar */
.colabm-sidebar {
  width: 260px;
  background: var(--co-sidebar-bg);
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 4px 0 20px rgba(0,0,0,0.2);
}

.sidebar-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.logo-text {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--co-primary);
  letter-spacing: -1px;
}
.subtitle {
  font-size: 0.75rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.colabm-sidebar nav { flex: 1; padding-top: 1rem; }
.colabm-sidebar nav ul { list-style: none; padding: 0; }
.colabm-sidebar nav li {
  padding: 1rem 2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}
.colabm-sidebar nav li:hover { opacity: 1; background: rgba(255,255,255,0.05); }
.colabm-sidebar nav li.active {
  opacity: 1;
  background: linear-gradient(90deg, rgba(59,130,246,0.2), transparent);
  border-left: 3px solid var(--co-primary);
}
.colabm-sidebar .num {
  font-family: var(--co-font-mono);
  opacity: 0.4;
  margin-right: 12px;
}
.sidebar-footer {
  padding: 1rem 2rem;
  font-size: 0.7rem;
  opacity: 0.3;
  border-top: 1px solid rgba(255,255,255,0.1);
}

/* Main Content */
.colabm-main {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  scroll-behavior: smooth;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 2rem 8rem;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.content-wrapper.fade-in { opacity: 1; }

/* Spotlight Card Effect (Glassmorphism + Glow) */
.spotlight-card {
  position: relative;
  background: var(--co-card-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari */
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Spotlight Hover Logic via ::before */
.spotlight-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 16px;
  padding: 2px; /* Border width */
  background: radial-gradient(
    800px circle at var(--mouse-x, 0) var(--mouse-y, 0), 
    rgba(59, 130, 246, 0.4), 
    transparent 40%
  );
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.spotlight-card:hover::before { opacity: 1; }
.spotlight-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }

/* Header Elements */
.doc-header { margin-bottom: 4rem; text-align: center; }
.doc-header h1 { font-size: 3rem; font-weight: 800; color: #111827; margin: 0; letter-spacing: -1px; }
.doc-subtitle { font-size: 1.2rem; color: var(--co-text-light); margin: 1rem 0; font-weight: 300; text-align: center;}
.doc-meta { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; }
.tag { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }

.intro-card { margin-top: 2rem; text-align: left; }
.intro-list { padding-left: 1.5rem; margin-top: 1rem; color: #4b5563; }
.intro-list li { margin-bottom: 0.5rem; }

/* Section Header Row (Title + Button) */
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--co-border);
  padding-bottom: 1rem;
}
.section-header-row h2 { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }

/* Attachment Button */
.attach-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  /* 新增/确保有这行，去掉a标签默认下划线 */
  text-decoration: none; 
}
.attach-btn svg { width: 16px; height: 16px; }
.attach-btn:hover { border-color: var(--co-primary); color: var(--co-primary); background: #eff6ff; }

/* Text & Math */
p { margin-bottom: 1.2rem; text-align: justify; }
.math-block { margin: 1.5rem 0; padding: 1rem; background: rgba(255,255,255,0.5); border-radius: 8px; text-align: center; overflow-x: auto; }
.math-inline { padding: 0 2px; }

/* Image Placeholder */
.img-placeholder {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: rgba(243, 244, 246, 0.5);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  cursor: pointer;
  transition: all 0.2s;
}
.img-placeholder:hover { border-color: var(--co-primary); background: rgba(239, 246, 255, 0.5); }
.img-content { text-align: center; display: flex; flex-direction: column; gap: 0.5rem; color: var(--co-text-light); }
.img-icon { font-size: 2rem; }
.img-placeholder small { font-size: 0.8rem; opacity: 0.7; }

/* Code Window */
.code-window { background: #282c34; border-radius: 8px; margin: 2rem 0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.window-header { background: #21252b; padding: 10px 16px; display: flex; align-items: center; }
.dots { display: flex; gap: 6px; margin-right: 12px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #ff5f56; } .dot.yellow { background: #ffbd2e; } .dot.green { background: #27c93f; }
.file-name { color: #abb2bf; font-family: var(--co-font-mono); font-size: 0.8rem; }
.code-content pre { margin: 0; padding: 1.5rem; overflow-x: auto; }
.code-content code { font-family: var(--co-font-mono) !important; font-size: 0.9rem; line-height: 1.5; }

/* Footer */
.doc-footer { text-align: center; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--co-border); font-size: 0.85rem; color: var(--co-text-light); }

/* Scrollbar */
.colabm-main::-webkit-scrollbar { width: 8px; }
.colabm-main::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 4px; }
.colabm-main::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.2); }

/* Responsive */
@media (max-width: 900px) {
  .colabm-layout { flex-direction: column; }
  .colabm-sidebar { width: 100%; height: auto; padding: 1rem; }
  .colabm-sidebar nav ul { display: flex; overflow-x: auto; gap: 1rem; }
  .colabm-sidebar nav li { padding: 0.5rem 1rem; white-space: nowrap; border-left: none; background: none; }
  .content-wrapper { padding: 2rem 1rem; }
  .doc-header h1 { font-size: 2rem; }
}
/* 图片容器：继承了 spotlight-card 的光照效果，但做了微调 */
.doc-figure {
  margin: 2.5rem 0;
  padding: 1rem; /* 给图片留一点内边距，像画框一样 */
  text-align: center;
  background: rgba(255, 255, 255, 0.5); /* 半透明白底 */
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.doc-figure:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.08);
}

/* 图片本体 */
.doc-figure img {
  max-width: 100%;
  height: auto;
  border-radius: 8px; /* 图片圆角 */
  display: block;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

/* 图片标题 */
.doc-figure figcaption {
  margin-top: 1rem;
  font-family: var(--co-font-mono); /* 使用等宽字体增加科技感 */
  font-size: 0.85rem;
  color: var(--co-text-light);
  font-weight: 500;
  letter-spacing: 0.5px;
}

</style>