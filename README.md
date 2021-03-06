# mint-to-sankey
Quickly convert transactions data from mint into a Sankey chart.

<img src="ss.png"></img>

## Usage

1. Download your Mint transaction data by logging into your account clicking on `TRANSACTIONS` and then choosing `Export all xxx transactions` at the bottom right of the listed transactions.
2. [Download](https://github.com/ConstantinoSchillebeeckx/mint-to-sankey/archive/master.zip) this repository.
3. Unzip the download and navigate to the unziped directory `mint-to-sankey-master`.
4. Open [index.html](index.html) in your browser, click the `Choose File` button and select the csv you downloaded in step 1.
5. To confirm things are working as they should, select the file `demo_data.csv`; the resulting chart should be very similar to the one shown above.

## A note about input data

Any type of transaction data can be visualized as long as you're uploading a csv with **at least the following columns**:

- `Amount` : value of the transaction
- `Transaction Type` : debit or credit
- `Category` : category for the transaction (e.g. Rent)
