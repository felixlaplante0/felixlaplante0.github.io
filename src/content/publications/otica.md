---
title: Contrast-Free ICA and Causal Inference via Wasserstein Distances to the Gaussian
authors: [laplante, ambroise, humbert]
venue: Under review at <em>JMLR</em> · arXiv preprint
date: 2026-07
arxiv: "2607.12832"
code:
  OT-ICA: https://github.com/felixlaplante0/otica
  OT-LiNGAM: https://github.com/felixlaplante0/otlingam
bibtex: |
  @misc{laplante2026contrast,
    title         = {Contrast-Free ICA and Causal Inference via Wasserstein Distances to the Gaussian},
    author        = {Laplante, F{\'e}lix and Ambroise, Christophe and Humbert, Pierre},
    year          = {2026},
    eprint        = {2607.12832},
    archiveprefix = {arXiv},
    primaryclass  = {stat.ML},
    url           = {https://arxiv.org/abs/2607.12832}
  }
---

We study the squared 2-Wasserstein distance to the standard Gaussian as a measure of non-Gaussianity for linear Independent Component Analysis (ICA) and causal inference in Linear Non-Gaussian Acyclic Models (LiNGAM). A strict inequality comparing independent standardized sources with their linear combinations yields population-level identification of the ICA unmixing matrix up to signed permutation, as well as a characterization of causal orders through least-squares residuals. We introduce empirical plug-in estimators with distribution-free uniform convergence guarantees under finite-moment assumptions and develop three practical solvers: an orthogonal Picard-style ICA optimizer, an exhaustive dynamic program for causal-order search, and a greedy alternative. Experiments show competitive results for source separation and causal inference.
