---
title: "Spectral Bridges: Scalable Spectral Clustering Based on Vector Quantization"
authors: [laplante, ambroise]
venue: <em>Computo</em> journal paper
date: 2024-12
doi: 10.57750/1gr8-bk61
arxiv: "2407.07430"
code: https://github.com/felixlaplante0/published-202412-ambroise-spectral
bibtex: |
  @article{laplante2024spectral,
    title     = {Spectral Bridges: Scalable Spectral Clustering Based on Vector Quantization},
    author    = {Laplante, F{\'e}lix and Ambroise, Christophe},
    journal   = {Computo},
    year      = {2024},
    doi       = {10.57750/1gr8-bk61},
    issn      = {2824-7795},
    publisher = {French Statistical Society}
  }
---

In this paper, Spectral Bridges, a novel clustering algorithm, is introduced. This algorithm builds upon the traditional k-means and spectral clustering frameworks by subdividing data into small Voronoï regions, which are subsequently merged according to a connectivity measure. Drawing inspiration from Support Vector Machine's margin concept, a non-parametric clustering approach is proposed, building an affinity margin between each pair of Voronoï regions. This approach delineates intricate, non-convex cluster structures and is robust to hyperparameter choice. The numerical experiments underscore Spectral Bridges as a fast, robust, and versatile tool for clustering tasks spanning diverse domains. Its efficacy extends to large-scale scenarios encompassing both real-world and synthetic datasets.
