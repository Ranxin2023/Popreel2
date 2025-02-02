import { distance } from 'ml-distance'; // Ensure you have a distance module or implement your own

type DistanceMetric = (a: number[], b: number[]) => number;

class KNN {
  private k: number;
  private data: number[][];
  private labels: any[];
  private distanceMetric: DistanceMetric;

  constructor(k: number, distanceMetric: DistanceMetric = distance.euclidean) {
    this.k = k;
    this.data = [];
    this.labels = [];
    this.distanceMetric = distanceMetric;
  }

  // Train the model with data points and their labels
  fit(data: number[][], labels: any[]): void {
    if (data.length !== labels.length) {
      throw new Error('The number of data points must match the number of labels.');
    }
    this.data = data;
    this.labels = labels;
  }

  // Predict the label for a given point
  predict(point: number[]): any {
    const distances = this.data.map((dataPoint, index) => ({
      index,
      distance: this.distanceMetric(point, dataPoint),
    }));

    distances.sort((a, b) => a.distance - b.distance);

    const kNearestLabels = distances
      .slice(0, this.k)
      .map((d) => this.labels[d.index]);

    // Implement majority voting
    const labelCounts: Record<string, number> = {};
    for (const label of kNearestLabels) {
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    }

    return Object.keys(labelCounts).reduce((a, b) =>
      labelCounts[a] > labelCounts[b] ? a : b
    );
  }
}

export default KNN;

// // Example usage
// const knn = new KNN(3);
// const trainingData = [
//   [1, 2],
//   [2, 3],
//   [3, 3],
//   [6, 5],
//   [7, 8],
// ];
// const labels = ['A', 'A', 'A', 'B', 'B'];

// knn.fit(trainingData, labels);

// const prediction = knn.predict([3, 3]);
// console.log('Predicted label:', prediction);
