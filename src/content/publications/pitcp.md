---
title: A Post-Processing Conformal Prediction Approach for Conditional Coverage via Pivotal Scores
authors: [laplante]
venue: Under review at an international conference · arXiv preprint
date: 2026-05
arxiv: "2605.25852"
code: https://github.com/felixlaplante0/pitcp/tree/paper
bibtex: |
  @misc{laplante2026post,
    title         = {A Post-Processing Conformal Prediction Approach for Conditional Coverage via Pivotal Scores},
    author        = {Laplante, F{\'e}lix},
    year          = {2026},
    eprint        = {2605.25852},
    archiveprefix = {arXiv},
    primaryclass  = {stat.ME},
    url           = {https://arxiv.org/abs/2605.25852}
  }
---

While Conformal Prediction (CP) has proven to be a powerful framework for uncertainty quantification, guaranteeing conditional coverage remains a central challenge. Although finite-sample, distribution-free conditional validity is known to be impossible without structural assumptions, we show that for i.i.d. data, it is fundamentally equivalent to constructing a nonconformity score whose distribution is independent of the features. This theoretical characterization motivates PIT-CP, a new post-processing correction that maps any base nonconformity score to an approximately invariant one while preserving its geometry, interpretability, and marginal coverage. This perspective is particularly appealing in practice, since it may be neither economical nor time-effective to retrain a full generative model when a strong prediction-driven model already provides highly accurate point estimates. Our procedure reduces the problem to one-dimensional conditional density estimation on the induced score, rather than full conditional density estimation on the original outcome space. We show how to estimate this transform in practice and derive bounds on the conditional coverage gap, alongside volumetric and symmetric-difference bounds. We present known minimax-optimal conditional estimation techniques while also motivating the use of modern conditional density estimators, including Mixture Density Networks and Conditional Normalizing Flows. Finally, we empirically demonstrate on various datasets that our PIT-CP procedure matches or outperforms many state-of-the-art conformal prediction strategies with minimal effort and computational cost.
