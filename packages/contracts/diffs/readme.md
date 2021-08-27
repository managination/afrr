This directory is only used to diff contract files between what Liquity has in their repo, what they have live, and our contracts. This code is NOT run or used for anything else

To compare Liquity live deployed contracts against what is in their repo:

```
./rundiffs.sh > diff-liquity-live-to-repo.log
```

To compare Liquity live deployed contracts against the ew versions in this repo:

```
./rundiffs-ew.sh > diff-liquity-live-ew-repo.log
```
