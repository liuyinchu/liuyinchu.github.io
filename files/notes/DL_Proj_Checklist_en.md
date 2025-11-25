# DL Project Checklist

## 0. Project Prerequisites

- [ ] Task type is clearly defined (classification / regression / detection / sequence / other).
- [ ] Business goal and success criteria are clearly stated.
- [ ] Data has basic cleaning (obvious junk / severe outliers handled).
- [ ] A reusable **train + eval** pipeline exists (single command / script).
- [ ] You can run multiple trials (in parallel or as a queue).

## 1. Metrics & Data Splits

### 1.1 Evaluation Metric

- [ ] List all relevant metrics (accuracy, F1, AUC, latency, memory, fairness, etc.).
- [ ] Mark **Satisficing constraints** (must-meet thresholds).
- [ ] Choose one **Optimizing metric** for model selection.
- [ ] Define a **single scalar score** `Score`:
  - [ ] Either equal to the Optimizing metric.
  - [ ] Or a simple formula combining several metrics.

### 1.2 Data Splits

- [ ] Split data into:
  - [ ] Train – for fitting parameters.
  - [ ] Dev (Validation) – for model / hyperparameter selection.
  - [ ] Test – for final reporting and external comparison.
- [ ] Dev & Test are as close as possible to **deployment distribution**.
- [ ] If Train distribution ≠ deployment distribution:
  - [ ] Create **Train-Dev** from the Train distribution.
  - [ ] Plan to compare Train vs Train-Dev vs Dev/Test to diagnose distribution mismatch.

## 2. Baseline Model & Training Config

### 2.1 Architecture

- [ ] Pick a **mature model family** close to the task (from recent papers / repos):
  - [ ] CV: ResNet / EfficientNet / ViT / etc.
  - [ ] NLP: Transformer / BERT / etc.
- [ ] Start with **small / base** scale, not the largest model.
- [ ] Record architecture version (for later comparison).

### 2.2 Optimizer

- [ ] Use a **well-established optimizer**:
  - [ ] SGD + Momentum / Nesterov
  - [ ] AdamW / Adam / Adafactor
- [ ] Start with community/default hyperparameters (except lr).
- [ ] Log all optimizer hyperparameters (lr, β1, β2, ε, weight decay, etc.).

### 2.3 Batch Size

- [ ] Empirically find the feasible batch range (no OOM).
- [ ] Measure throughput (samples/sec) for candidate batch sizes.
- [ ] Choose a batch size near the point where throughput stops scaling well.
- [ ] Note: changing batch size later **requires re-tuning**:
  - [ ] Learning rate
  - [ ] Regularization strength
  - [ ] Training steps / schedule

### 2.4 Baseline Training Run

- [ ] Choose a simple lr schedule:
  - [ ] Constant / Linear decay / Cosine decay.
- [ ] Set an initial `max_train_steps` (from experience or small test runs).
- [ ] Run a baseline training:
  - [ ] Dev metric is clearly better than random.
  - [ ] Training is stable (no frequent NaNs / divergence).

## 3. Tuning Loop (Per Round)

> **One round = one main question.**

### 3.1 Define the Round Goal

- [ ] Specify **one primary question** for this round, e.g.:
  - [ ] Does a deeper network help (with proper tuning)?
  - [ ] Does dropout yield net benefit?
  - [ ] What is a good lr range?
  - [ ] Is a certain data augmentation useful?
- [ ] Avoid solving multiple big questions in one round.

### 3.2 Design the Study

- [ ] Classify hyperparameters:
  - [ ] **Target hyperparams** – what you want to compare (e.g., depth, use_dropout).
  - [ ] **Nuisance hyperparams** – must be tuned for each target setting (e.g., lr, weight decay).
  - [ ] **Fixed hyperparams** – unchanged in this round.
- [ ] Define search spaces (bounds + linear/log scale) for all tuned hyperparams.
- [ ] Choose search algorithm:
  - [ ] **Exploration**: quasi-random / random search.
  - [ ] **Exploitation**: Bayesian optimization.
- [ ] Decide number of trials (limited by compute):
  - [ ] Multiple trials per target hyperparam value.
  - [ ] Reasonable coverage of search space.

### 3.3 Run & Analyze

- [ ] For each trial, record:
  - [ ] Full hyperparameter config.
  - [ ] Training & Dev curves (metric vs steps).
  - [ ] Best Dev metric and corresponding step.
- [ ] Plot & inspect:
  - [ ] **Hyperparameter axis plots** (x: hyperparam, y: Dev score):
    - [ ] Are best points at the boundary? → Expand search range.
    - [ ] Many divergent points? → Check stability / upper bounds.
  - [ ] **Training curves** for top trials:
    - [ ] Overfitting? (Dev metric rises after some point.)
    - [ ] Early saturation? (no improvement long before `max_train_steps`).
    - [ ] Instabilities or large spikes?
- [ ] Diagnose error structure:
  - [ ] High Train error vs human/chart → **high bias**.
  - [ ] Low Train, high Dev → **high variance**.
  - [ ] Good Train-Dev, bad Dev/Test → **data mismatch**.
- [ ] Error analysis:
  - [ ] Sample ~100–200 Dev errors.
  - [ ] Categorize by scenario / class / label issues.
  - [ ] Identify largest & most actionable error types.

### 3.4 Decide Baseline Update

- [ ] Re-train best new config and old baseline with several seeds to estimate variance.
- [ ] If improvement > variance and complexity cost is acceptable:
  - [ ] Promote new config to **baseline**.
- [ ] Otherwise:
  - [ ] Keep baseline; record new config as “interesting but not adopted”.

## 4. Diagnosis & Improvement Decisions

### 4.1 Bias / Variance / Mismatch

- [ ] **High bias** (Train error high):
  - [ ] Try larger / deeper models.
  - [ ] Better architectures / features.
  - [ ] Train longer or slightly increase lr.
  - [ ] Reduce regularization.
- [ ] **High variance** (Train low, Dev high):
  - [ ] Collect more training data.
  - [ ] Stronger regularization (L2, dropout, data augmentation).
  - [ ] Smaller model capacity.
- [ ] **Data mismatch** (Train-Dev good, Dev/Test bad):
  - [ ] Collect training data closer to Dev/Test.
  - [ ] Reweight training samples (domain reweighting).
  - [ ] Domain adaptation methods.

### 4.2 Label Quality

- [ ] If Dev/Test have significant label errors:
  - [ ] Prioritize cleaning Dev/Test to restore trust in metrics.
- [ ] If Train has systematic label noise on important subsets:
  - [ ] Plan targeted relabeling or revise labeling rules.

### 4.3 Transfer Learning & End-to-End

- [ ] Target data limited, modality standard (image / text / speech):
  - [ ] Prefer **pretrained model + task head** (transfer learning).
- [ ] Lots of end-to-end data, intermediate labels hard to get:
  - [ ] Consider **end-to-end models** (accepting higher complexity).
- [ ] Data limited, intermediate tasks easy to label:
  - [ ] Prefer **multi-stage pipeline** over pure end-to-end.

## 5. Training Length & Stability

### 5.1 Training Steps

- [ ] Decide regime:
  - [ ] **Compute-bound**: steps limited by budget/time.
  - [ ] **Not compute-bound**: can train as long as needed.
- [ ] If **not compute-bound**:
  - [ ] Run small constant-lr experiments to estimate steps needed to nearly “fit” Train.
  - [ ] Use that as initial `max_train_steps`, then refine using training curves.
- [ ] If **compute-bound**:
  - [ ] Use multi-round strategy:
    - [ ] Round 1: short runs (e.g. 10–20% of full budget) for broad tuning.
    - [ ] Round 2: near-full-length runs for top configs.

### 5.2 Stability (Gate Before Massive Tuning)

- [ ] Check for instability:
  - [ ] Slightly larger lr → NaNs / divergence?
  - [ ] Occasional huge gradient norm spikes?
  - [ ] Loss blow-up in early training then slow recovery?
- [ ] Mitigation order:
  - [ ] **LR warmup**:
    - [ ] Linearly increase lr from 0 to target lr; scan warmup steps.
  - [ ] **Gradient clipping**:
    - [ ] Record gradient norm distribution.
    - [ ] Start threshold around 90th percentile, adjust as needed.
  - [ ] **Architecture hygiene**:
    - [ ] Reasonable residual structure, normalization, initialization.
  - [ ] **Last resort**: lower peak lr.

## 6. Engineering & Reproducibility

### 6.1 Input Pipeline & Performance

- [ ] Use framework profilers to check if training is I/O-bound.
- [ ] If yes:
  - [ ] Localize/cache data.
  - [ ] Move expensive preprocessing offline where possible.
  - [ ] Use prefetch / parallel mapping.
  - [ ] For multi-host, use data services / sharding.

### 6.2 Evaluation & Checkpoints

- [ ] Periodic evaluation:
  - [ ] Use eval batch size ≥ train batch size.
  - [ ] Evaluate at **fixed step intervals**, not time intervals.
- [ ] Checkpoint policy:
  - [ ] Save model state regularly.
  - [ ] Support **retrospective selection** of best Dev checkpoint at end.
- [ ] Save:
  - [ ] Training curves (metrics vs steps).
  - [ ] Some per-example predictions (for debugging/error analysis).

### 6.3 Experiment Tracking

- [ ] For each **study**, record:
  - [ ] Study ID / name.
  - [ ] Target / nuisance hyperparam definitions.
  - [ ] Search space & search algorithm.
  - [ ] Each trial’s config & best Dev metric.
  - [ ] ID of chosen best checkpoint.
- [ ] Use a shared tracking system (tool or spreadsheet), not ad-hoc notes.

### 6.4 Multi-Host / Multi-Device

- [ ] Only one host writes logs & checkpoints.
- [ ] BN / other statistics correctly synchronized across devices.
- [ ] Initialization seed is controlled; shuffle seeds are separate but tracked.
- [ ] Data is sharded across devices to avoid hotspots.

## 7. Quick Runbook for LLM / Agent

When an LLM / Agent is asked to “help optimize a DL project”, follow:

1. [ ] Parse task description → extract **task type** & **business goal**.
2. [ ] Check / propose: single scalar metric + constraints + data splits.
3. [ ] If no baseline:
   - [ ] Propose architecture family + size.
   - [ ] Propose optimizer + batch size + schedule + training steps.
4. [ ] Identify current bottleneck (bias / variance / mismatch / stability / data).
5. [ ] Define **one main goal** for this round.
6. [ ] Classify hyperparams (target / nuisance / fixed) + define search spaces + trial budget.
7. [ ] Output concrete trial configs suitable for automated launch.
8. [ ] After results (real or hypothetical), perform:
   - [ ] Search space boundary check.
   - [ ] Training curve analysis.
   - [ ] Bias / variance / mismatch diagnosis.
   - [ ] Error analysis suggestions.
9. [ ] Decide whether to update baseline; propose next round’s main goal.
