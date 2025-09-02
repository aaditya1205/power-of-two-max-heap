import java.util.NoSuchElementException;
import java.util.Random;

/**
 * Power-of-Two Max Heap.
 *
 * Each parent has (2^powerOfTwoExponent) children.
 *
 * Generics: E must be Comparable.
 *
 * Only provides insert(E) and popMax() (plus a few small helpers used by tests).
 *
 * Implementation notes:
 *  - Backed by a resizable Object[] array to avoid boxing/unnecessary objects.
 *  - Iterative sift-up and sift-down for performance.
 *  - child indices computed as: firstChild = index * d + 1, children range [firstChild, firstChild + d - 1]
 *  - parent index for node i is (i - 1) / d   (integer division)
 *
 * Corner cases handled:
 *  - powerOfTwoExponent < 0 or > 30 -> IllegalArgumentException (to avoid overflow of 1 << exponent)
 *  - insert(null) -> NullPointerException
 *  - popMax() on empty -> NoSuchElementException
 */
public final class PowerOfTwoMaxHeap<E extends Comparable<? super E>> {
    private static final int DEFAULT_CAPACITY = 16;

    /** The exponent used to compute children per node: childrenPerNode = 2^powerOfTwoExponent */
    private final int powerOfTwoExponent;

    /** Number of children per parent: d = 2^powerOfTwoExponent */
    private final int childrenPerNode;

    /** Array backing the heap (contains E values stored as Object) */
    private Object[] heap;

    /** Current number of elements in heap */
    private int size;

    /**
     * Construct a new heap with the given power-of-two exponent.
     *
     * @param powerOfTwoExponent exponent (>=0). Branching factor = 2^powerOfTwoExponent.
     */
    public PowerOfTwoMaxHeap(int powerOfTwoExponent) {
        if (powerOfTwoExponent < 0) {
            throw new IllegalArgumentException("powerOfTwoExponent must be >= 0");
        }
        if (powerOfTwoExponent > 30) {
            // shifting beyond 30 risks overflow of the int (1 << 31 is signed negative).
            throw new IllegalArgumentException("powerOfTwoExponent is too large (must be <= 30)");
        }
        this.powerOfTwoExponent = powerOfTwoExponent;
        this.childrenPerNode = 1 << powerOfTwoExponent; // 2^exponent
        this.heap = new Object[DEFAULT_CAPACITY];
        this.size = 0;
    }

    /** Return number of elements in the heap. */
    public int size() {
        return size;
    }

    /** True if the heap is empty. */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * Insert a value into the heap.
     *
     * @param value non-null value to insert
     * @throws NullPointerException if value is null
     */
    public void insert(E value) {
        if (value == null) throw new NullPointerException("null values are not supported");
        ensureCapacity(size + 1);
        heap[size] = value;
        siftUp(size);
        size++;
    }

    /**
     * Remove and return the maximum element.
     *
     * @return the max element
     * @throws NoSuchElementException when heap is empty
     */
    @SuppressWarnings("unchecked")
    public E popMax() {
        if (size == 0) throw new NoSuchElementException("pop from empty heap");
        E max = (E) heap[0];
        int lastIndex = size - 1;
        // move last element to root (if lastIndex == 0, just remove)
        heap[0] = heap[lastIndex];
        heap[lastIndex] = null; // help GC
        size--;
        if (size > 0) {
            siftDown(0);
        }
        return max;
    }

    /* ---------------- internal helpers ---------------- */

    /** Ensure backing array can hold at least requiredCapacity elements. */
    private void ensureCapacity(int requiredCapacity) {
        if (requiredCapacity <= heap.length) return;
        // grow by doubling which is simple and performant
        int newCapacity = heap.length << 1;
        if (newCapacity < requiredCapacity) newCapacity = requiredCapacity;
        Object[] newHeap = new Object[newCapacity];
        System.arraycopy(heap, 0, newHeap, 0, size);
        heap = newHeap;
    }

    /** Sift the element at index up until heap property restored. Iterative. */
    @SuppressWarnings("unchecked")
    private void siftUp(int index) {
        // Keep the element local to reduce repeated array accesses
        Object moving = heap[index];
        while (index > 0) {
            int parent = (index - 1) / childrenPerNode;
            Object parentVal = heap[parent];
            // compare moving and parentVal
            if (((E) parentVal).compareTo((E) moving) >= 0) {
                // parent >= moving -> heap property satisfied
                break;
            }
            // otherwise swap parent down and continue
            heap[index] = parentVal;
            index = parent;
        }
        heap[index] = moving;
    }

    /** Sift the element at index down until heap property restored. Iterative. */
    @SuppressWarnings("unchecked")
    private void siftDown(int index) {
        Object moving = heap[index];
        // Use long to compute firstChildBase to avoid int overflow for large d and large index
        while (true) {
            long childBaseLong = (long) index * childrenPerNode + 1L;
            if (childBaseLong >= size) break; // no children
            int firstChildIndex = (int) childBaseLong;
            int lastChildIndex = firstChildIndex + childrenPerNode - 1;
            if (lastChildIndex >= size) lastChildIndex = size - 1;

            // Find the largest child among the up-to-d children
            int largestChildIndex = firstChildIndex;
            Object largestChildValue = heap[largestChildIndex];
            for (int j = firstChildIndex + 1; j <= lastChildIndex; j++) {
                Object childVal = heap[j];
                if (((E) childVal).compareTo((E) largestChildValue) > 0) {
                    largestChildValue = childVal;
                    largestChildIndex = j;
                }
            }

            // If the largest child is <= moving, we are done
            if (((E) largestChildValue).compareTo((E) moving) <= 0) {
                break;
            }

            // Otherwise move the largest child up, continue sifting down
            heap[index] = largestChildValue;
            index = largestChildIndex;
        }
        heap[index] = moving;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("PowerOfTwoMaxHeap(d=").append(childrenPerNode).append(", size=").append(size).append(") [");
        for (int i = 0; i < size; i++) {
            if (i > 0) sb.append(", ");
            sb.append(heap[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    /* ---------------- simple self-tests / demonstration in main ---------------- */

    public static void main(String[] args) {
        System.out.println("PowerOfTwoMaxHeap self-checks");
        int[] exponentsToTest = {0, 1, 2, 4, 8, 16}; // includes small and large branching factors
        final int N = 5000; // number of inserts per test
        final Random rng = new Random(42);

        for (int exponent : exponentsToTest) {
            System.out.println("\n--- Testing exponent = " + exponent + " (d = " + (1 << exponent) + ") ---");
            PowerOfTwoMaxHeap<Integer> heap = new PowerOfTwoMaxHeap<>(exponent);

            // Insert N random integers (including duplicates)
            for (int i = 0; i < N; i++) {
                heap.insert(rng.nextInt(1000000));
            }

            // Pop all elements and verify non-increasing order
            boolean ok = true;
            int prev = Integer.MAX_VALUE;
            long t0 = System.nanoTime();
            for (int i = 0; i < N; i++) {
                int cur = heap.popMax();
                if (cur > prev) {
                    ok = false;
                    System.err.println("Heap property violated: popped " + cur + " after " + prev);
                    break;
                }
                prev = cur;
            }
            long elapsedMs = (System.nanoTime() - t0) / 1_000_000;
            System.out.println("Correct: " + ok + ". Time to pop " + N + " items: " + elapsedMs + " ms.");
            System.out.println("Final heap size (should be 0): " + heap.size());

            // quick sanity: pop from empty should raise
            boolean poppedEmptyRaised = false;
            try {
                heap.popMax();
            } catch (NoSuchElementException e) {
                poppedEmptyRaised = true;
            }
            System.out.println("pop on empty throws: " + poppedEmptyRaised);
        }

        // Additional micro-check: small, predictable sequence
        PowerOfTwoMaxHeap<Integer> smallHeap = new PowerOfTwoMaxHeap<>(2); // d = 4
        smallHeap.insert(10);
        smallHeap.insert(40);
        smallHeap.insert(20);
        smallHeap.insert(5);
        smallHeap.insert(40); // duplicate
        System.out.println("\nSmall heap content: " + smallHeap);
        System.out.println("Popping all:");
        while (!smallHeap.isEmpty()) {
            System.out.println("  " + smallHeap.popMax());
        }
        System.out.println("All tests done.");
    }
}
