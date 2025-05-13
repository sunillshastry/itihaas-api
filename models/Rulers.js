const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: false,
    },
    otherNames: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    born: {
      type: String,
      required: false,
      unique: false,
      default: null,
    },
    died: {
      type: String,
      required: false,
      unique: false,
      default: null,
    },
    dynasty: {
      type: String,
      required: false,
      unique: false,
      default: null,
    },
    religion: {
      type: String,
      required: false,
      unique: false,
      default: null,
    },
    predecessor: {
      type: String,
      required: false,
      unique: false,
      default: null,
    },
    successor: {
      type: String,
      required: false,
      unique: false,
      default: null,
    },
    family: {
      father: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
      mother: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
      wives: {
        type: [String],
        required: false,
        unique: false,
        default: [],
      },
      children: {
        type: [String],
        required: false,
        unique: false,
        default: [],
      },
    },
    wars: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    timeline: {
      begin: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
      end: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
    },
    description: {
      oneline: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
      long: {
        type: [String],
        required: false,
        unique: false,
        default: [],
      },
    },
    sources: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    furtherReading: {
      type: [
        {
          publisher: {
            type: String,
            required: false,
            unique: false,
            default: null,
          },
          link: {
            type: String,
            required: false,
            unique: false,
            default: null,
          },
        },
      ],
    },
    articles: {
      type: [
        {
          title: {
            type: String,
            required: false,
            unique: false,
            default: null,
          },
          authors: {
            type: [String],
            required: false,
            unique: false,
            default: [],
          },
          publisher: {
            type: String,
            required: false,
            unique: false,
            default: null,
          },
          link: {
            type: String,
            required: false,
            unique: false,
            default: null,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

const model = mongoose.model('Ruler', schema);

module.exports = model;
