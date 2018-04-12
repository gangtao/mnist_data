"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function() {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function(arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance"
      );
    }
  };
})();

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step("next", value);
            },
            function(err) {
              step("throw", err);
            }
          );
        }
      }
      return step("next");
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var IMAGE_SIZE = 784;
var NUM_CLASSES = 10;
var NUM_DATASET_ELEMENTS = 65000;

var NUM_TRAIN_ELEMENTS = 55000;
var NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;

var MNIST_IMAGES_SPRITE_PATH =
  "https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png";
var MNIST_LABELS_PATH =
  "https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8";

/**
 * A class that fetches the sprited MNIST dataset and returns shuffled batches.
 *
 * NOTE: This will get much easier. For now, we do data fetching and
 * manipulation manually.
 */

var MnistData = (exports.MnistData = (function() {
  function MnistData() {
    _classCallCheck(this, MnistData);

    this.shuffledTrainIndex = 0;
    this.shuffledTestIndex = 0;
  }

  _createClass(MnistData, [
    {
      key: "load",
      value: (function() {
        var _ref = _asyncToGenerator(
          /*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
            var _this = this;

            var img,
              canvas,
              ctx,
              imgRequest,
              labelsRequest,
              _ref2,
              _ref3,
              imgResponse,
              labelsResponse;

            return regeneratorRuntime.wrap(
              function _callee$(_context) {
                while (1) {
                  switch ((_context.prev = _context.next)) {
                    case 0:
                      // Make a request for the MNIST sprited image.
                      img = new Image();
                      canvas = document.createElement("canvas");
                      ctx = canvas.getContext("2d");
                      imgRequest = new Promise(function(resolve, reject) {
                        img.crossOrigin = "";
                        img.onload = function() {
                          img.width = img.naturalWidth;
                          img.height = img.naturalHeight;

                          var datasetBytesBuffer = new ArrayBuffer(
                            NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4
                          );

                          var chunkSize = 5000;
                          canvas.width = img.width;
                          canvas.height = chunkSize;

                          for (
                            var i = 0;
                            i < NUM_DATASET_ELEMENTS / chunkSize;
                            i++
                          ) {
                            var datasetBytesView = new Float32Array(
                              datasetBytesBuffer,
                              i * IMAGE_SIZE * chunkSize * 4,
                              IMAGE_SIZE * chunkSize
                            );
                            ctx.drawImage(
                              img,
                              0,
                              i * chunkSize,
                              img.width,
                              chunkSize,
                              0,
                              0,
                              img.width,
                              chunkSize
                            );

                            var imageData = ctx.getImageData(
                              0,
                              0,
                              canvas.width,
                              canvas.height
                            );

                            for (
                              var j = 0;
                              j < imageData.data.length / 4;
                              j++
                            ) {
                              // All channels hold an equal value since the image is grayscale, so
                              // just read the red channel.
                              datasetBytesView[j] = imageData.data[j * 4] / 255;
                            }
                          }
                          _this.datasetImages = new Float32Array(
                            datasetBytesBuffer
                          );

                          resolve();
                        };
                        img.src = MNIST_IMAGES_SPRITE_PATH;
                      });
                      labelsRequest = fetch(MNIST_LABELS_PATH);
                      _context.next = 7;
                      return Promise.all([imgRequest, labelsRequest]);

                    case 7:
                      _ref2 = _context.sent;
                      _ref3 = _slicedToArray(_ref2, 2);
                      imgResponse = _ref3[0];
                      labelsResponse = _ref3[1];
                      _context.t0 = Uint8Array;
                      _context.next = 14;
                      return labelsResponse.arrayBuffer();

                    case 14:
                      _context.t1 = _context.sent;
                      this.datasetLabels = new _context.t0(_context.t1);

                      // Create shuffled indices into the train/test set for when we select a
                      // random dataset element for training / validation.
                      this.trainIndices = tf.util.createShuffledIndices(
                        NUM_TRAIN_ELEMENTS
                      );
                      this.testIndices = tf.util.createShuffledIndices(
                        NUM_TEST_ELEMENTS
                      );

                      // Slice the the images and labels into train and test sets.
                      this.trainImages = this.datasetImages.slice(
                        0,
                        IMAGE_SIZE * NUM_TRAIN_ELEMENTS
                      );
                      this.testImages = this.datasetImages.slice(
                        IMAGE_SIZE * NUM_TRAIN_ELEMENTS
                      );
                      this.trainLabels = this.datasetLabels.slice(
                        0,
                        NUM_CLASSES * NUM_TRAIN_ELEMENTS
                      );
                      this.testLabels = this.datasetLabels.slice(
                        NUM_CLASSES * NUM_TRAIN_ELEMENTS
                      );

                    case 22:
                    case "end":
                      return _context.stop();
                  }
                }
              },
              _callee,
              this
            );
          })
        );

        function load() {
          return _ref.apply(this, arguments);
        }

        return load;
      })()
    },
    {
      key: "nextTrainBatch",
      value: function nextTrainBatch(batchSize) {
        var _this2 = this;

        return this.nextBatch(
          batchSize,
          [this.trainImages, this.trainLabels],
          function() {
            _this2.shuffledTrainIndex =
              (_this2.shuffledTrainIndex + 1) % _this2.trainIndices.length;
            return _this2.trainIndices[_this2.shuffledTrainIndex];
          }
        );
      }
    },
    {
      key: "nextTestBatch",
      value: function nextTestBatch(batchSize) {
        var _this3 = this;

        return this.nextBatch(
          batchSize,
          [this.testImages, this.testLabels],
          function() {
            _this3.shuffledTestIndex =
              (_this3.shuffledTestIndex + 1) % _this3.testIndices.length;
            return _this3.testIndices[_this3.shuffledTestIndex];
          }
        );
      }
    },
    {
      key: "nextBatch",
      value: function nextBatch(batchSize, data, index) {
        var batchImagesArray = new Float32Array(batchSize * IMAGE_SIZE);
        var batchLabelsArray = new Uint8Array(batchSize * NUM_CLASSES);

        for (var i = 0; i < batchSize; i++) {
          var idx = index();

          var image = data[0].slice(
            idx * IMAGE_SIZE,
            idx * IMAGE_SIZE + IMAGE_SIZE
          );
          batchImagesArray.set(image, i * IMAGE_SIZE);

          var label = data[1].slice(
            idx * NUM_CLASSES,
            idx * NUM_CLASSES + NUM_CLASSES
          );
          batchLabelsArray.set(label, i * NUM_CLASSES);
        }

        var xs = tf.tensor2d(batchImagesArray, [batchSize, IMAGE_SIZE]);
        var labels = tf.tensor2d(batchLabelsArray, [batchSize, NUM_CLASSES]);

        return { xs: xs, labels: labels };
      }
    }
  ]);

  return MnistData;
})());
