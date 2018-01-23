#!/usr/bin/env python

'''
Will convert a CSV export from mint, which contains a series of transactions,
into a JSON format which can be used with `mint_to_sankey.js` to generate
a Sankey chart of these transactions.

Script assumes the input file is named `transactions.csv` and will output
to `data.js`

Requires:

    - Pandas

Usage:

    python convert.py
    
'''

import pandas as pd
import json

input_file = 'transactions.csv'
output_file = 'data.js'

# read in transactions
raw = pd.read_csv(input_file)

# convert to json string
# https://gist.github.com/adamgreenhall/4755513
dat = raw.transpose().to_dict().values()

# write to file
with open(output_file, 'w') as fout:
    fout.write("var data_raw = ")
    fout.write(json.dumps(dat, indent=4))
