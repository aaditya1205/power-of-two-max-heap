# Power-of-Two Max Heap (Java)

A Java implementation of a novel priority queue: the **Power-of-Two Max Heap**.  
Unlike a traditional binary heap, each parent in this data structure has `2^k` children, where `k` is a configurable exponent. The heap maintains the max-heap property and supports efficient **insert** and **popMax** operations.  

---

## Features
- Configurable branching factor (`2^powerOfTwoExponent`)
- Array-backed, memory-efficient design
- Iterative sift-up and sift-down for performance
- Supports `insert(E value)` and `popMax()`
- Handles small and large branching factors
- Includes built-in test harness in `main`

---

## Usage

### Compile and Run
```bash
javac src/PowerOfTwoMaxHeap.java
java -cp src PowerOfTwoMaxHeap
