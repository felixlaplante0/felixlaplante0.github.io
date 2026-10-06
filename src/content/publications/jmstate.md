---
title: A General Framework for Joint Multi-State Models
authors: [laplante, ambroise]
venue: Under review at <em>Statistics and Computing</em> · arXiv preprint
date: 2025-10
arxiv: "2510.07128"
code: https://github.com/felixlaplante0/jmstate
bibtex: |
  @misc{laplante2025joint,
    title         = {A General Framework for Joint Multi-State Models},
    author        = {Laplante, F{\'e}lix and Ambroise, Christophe},
    year          = {2025},
    eprint        = {2510.07128},
    archiveprefix = {arXiv},
    primaryclass  = {stat.ME},
    url           = {https://arxiv.org/abs/2510.07128}
  }
---

Conventional joint modeling approaches generally characterize the relationship between longitudinal biomarkers and discrete event occurrences within terminal, recurring or competing risk settings, thereby offering a limited representation of complex, multi-state trajectories. We propose a general multi-state joint modeling framework that unifies longitudinal biomarker dynamics with multi-state time-to-event processes defined on arbitrary directed graphs. The proposed framework also accomodates nonlinear longitudinal submodels and scalable inference via stochastic gradient descent. This formulation encompasses both Markovian and semi-Markovian transition structures, allowing recurrent cycles and terminal absorptions to be naturally represented. The longitudinal and event processes are linked through shared latent structures within nonlinear mixed-effects models, extending classical joint modeling formulations. We derive the complete likelihood, model selection criteria, and develop scalable inference procedures based on stochastic gradient descent to enable high-dimensional and large-scale applications. In addition, we formulate a dynamic prediction framework that provides individualized state-transition probabilities and personalized risk assessments along complex event trajectories. Through simulation and application to the PAQUID cohort, we demonstrate accurate parameter recovery and individualized prediction.
