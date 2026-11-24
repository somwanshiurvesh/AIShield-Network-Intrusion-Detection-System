# NIDS Data

This directory contains datasets for training and testing the Network Intrusion Detection System.

## Datasets

### NSL-KDD
NSL-KDD is a dataset suggested to solve some of the inherent problems of the KDD'99 dataset. It can be used as an effective benchmark dataset to help researchers compare different intrusion detection methods.

Expected files:
- `KDDTrain+.txt` - Training dataset
- `KDDTest+.txt` - Test dataset
- `KDDTrain+_20Percent.txt` - A smaller version of the training dataset
- `KDDTest-21.txt` - A subset of the test dataset

### Other Datasets
Additional datasets can be added to this directory as needed.

## Data Format

Each dataset should be in CSV format with features as columns and samples as rows. The last column should be the class label indicating whether the record is an intrusion or normal traffic.

## Download Instructions

NSL-KDD dataset can be downloaded from:
- https://www.unb.ca/cic/datasets/nsl.html

After downloading, place the files in this directory. 