---
layout: default
usage: |
  ### Usage

  1. Download your Mint transaction data by logging into your account clicking on `TRANSACTIONS` and then choosing `Export all xxx transactions` at the bottom right of the listed transactions.
  2. Assuming you have git installed, run the following `git clone git@github.com:ConstantinoSchillebeeckx/mint-to-sankey.git --recursive`
  3. Navigate to the unziped directory `mint-to-sankey`.
  4. Open [index.html](index.html) in your browser, click the `Choose File` button and select the csv you downloaded in step 1.

  ### A note about input data

  Any type of transaction data can be visualized as long as you're uploading a csv with **at least the following columns**:

  - `Amount` : value of the transaction
  - `Transaction Type` : debit or credit
  - `Category` : category for the transaction (e.g. Rent)
---


### Choose your own data, or use `demo_data.csv` as an example
<input type="file" id="upload" accepts=".csv" onchange="handleFiles(this.files[0])">


<div id="sankey" class="nvd3"></div>

<script>
    // render initial chart
    $(function(){ 
        var demo_data = {{ site.data.demo_data | jsonify }}
        render(demo_data)
    })
</script>
