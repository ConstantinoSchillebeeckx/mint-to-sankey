function prepData(dat, incomeParent) {
    /*
     * Prepare data for use with Sankey plot.
     *
     * @param dat {obj} : input data of the form
     * @param incomeParent {str} : name of parent group for all income, this
     *    node is used to join credit transactions to debit transactions. If
     *    not specified, all transactions are considered debit.
     * 
     * @return {obj} : data for Sankey chart in the form
     *       {"nodes": 
     *         [
     *           {"name": "Utilities", "Transaction Type": "debit"},
     *           {"name": "Rent", "Transaction Type": "debit"},
     *           {"name": "Bills & Utilities", "Transaction Type": "debit"}
     *         ],
     *        "links":
     *         [
     *           {"source": "Bills & Utilities", "target": "Rent", "value":932.3},
     *           {"source": "Bill & Utilities", "target": "Utilities", "value":74.00}
     *         ]
     *       }
     */

    var nodes = [], links = [];
    var debitSum = {};

    // Input data must have, at a minimum, the following object properties:
    //     - `Amount` : the transaction amount
    //     - `Transaction Type` : either 'debit' or 'credit'
    //     - `Category` : transaction category (e.g. 'Utilities')
    // Any other properties will simply be passed onto the node in the chart.
    //
    // Groups defines how transaction categories are grouped together.
    //
    // For example the group:
    //    `'Travel': ['Rental Car & Taxi','Hotel','Air Travel']`
    // will place all transactions with the Category 'Rental Car & Tax', 
    // 'Hotel' or 'Air Travel' into the parent group 'Travel'. Furthermore,
    // any transactions with the Category 'Travel' will also be placed into
    // the 'Travel' parent group since Mint won't always properly categorize
    // the transaction into one of the sub-groups.
    // Any transactions with categories not listed in any of the groups will
    // simply be ignored.
    var groups = {
        'Auto & Transport': ['Gas & Fuel','Parking','Service & Parts','Public Transportation','Auto Insurance','Auto Payment'],
        'Bills & Utilities': ['Internet','Utilities','Mobile Phone','Rent','Home Phone'],
        'Business Services': ['Shipping','Web hosting'],
        'Education': ['Books & Supplies'],
        'Entertainment': ['Movies & DVDs','Music','Newspapers & Magazines','Amusement','Entertainment'],
        'Fees & Charges': ['Finance Charge','Service Fee','ATM Fee'],
        'Financial': ['Investment',529,'Cryptocurrency','Financial Advisor','Life Insurance'],
        'Food & Dining': ['Groceries','Coffee Shops','Fast Food','Restaurants','Alcohol & Bars'],
        'Gifts & Donations': ['Gift','Charity'],
        'Health & Fitness': ['Gym','Pharmacy','Doctor','Sports','Eyecare'],
        'Home': ['Furnishings','Home Improvement','Lawn & Garden','Home Supplies','Home Services'],
        'Misc Expenses': ['Cash Withdrawel'],
        'Personal Care': ['Hair'],
        'Pets': ['Pet Food & Supplies'],
        'Shopping': ['Hobbies','Electronics & Software','Clothing','Sporting Goods'],
        'Taxes': ['Property Tax','Federal Tax','State Tax'],
        'Travel': ['Rental Car & Taxi','Hotel','Air Travel'],
        'Uncategorized': ['Cash & ATM','Check']
    }
    if (typeof(incomeParent) !== 'undefined') {
        groups[incomeParent] = ['Interest Income', 'Freelance', 'Reimbursement', 'Paycheck']
    }

    for (var group in groups) {

        // filter down to data of interest
        keep_category = groups[group]
        keep_category.push(group);
        var filtered = dat.filter(function(d, i) {
            return keep_category.indexOf(d.Category) !== -1;
        })

        // if we've filtered everything out
        // because these categories don't exist
        if (filtered.length == 0) break

        // naively take the first transaction to set
        // the transaction type
        var type = filtered[0]['Transaction Type']

        // group income on Category and sum all transaction amounts
        var nested = d3.nest()
                        .key(function (d) { return d.Category; })
                        .rollup(function(group) { 
                            return {
                                'sum': d3.sum(group, function(d) { return d.Amount}),
                                'meta': group[0]
                            }
                        })
                        .entries(filtered)

        // sum value for parent debit group
        // in order to make the link between
        // debit and credit
        if (type == 'debit') {
            debitSum[group] = d3.sum(nested, function(d) { return d.values.sum })
        }

        // generate nodes
        // some transactions may be categorized by the parent category
        // (e.g. Bill & Utilities), therefore we append a '_' to the
        // parent category to make it distinct, this acts as the source
        // for a transaction
        nodes.push({
            'name': '_'+group,
            'Transaction Type': type
        }) // manually at parent node
        nested.forEach(function (d) {
            var node = {'name': d.key}
            for (var i in d.values.meta) {
                if (i !== 'Amount') node[i] = d.values.meta[i];
            }
            nodes.push(node);
        })

        // generate links
        nested.forEach(function (d) {
            links.push({
                'target': type == 'debit' ? d.key : '_'+group,
                'source': type == 'credit' ? d.key : '_'+group,
                'value': d.values.sum
            });
        })
    }

    var all_nodes = [];
    links.forEach(function(d) {
        if (all_nodes.indexOf(d.source) == -1) all_nodes.push(d.source);
        if (all_nodes.indexOf(d.target) == -1) all_nodes.push(d.target);
    })

    // remove any nodes without links
    nodes = nodes.filter(function(node) {
        return all_nodes.indexOf(node.name) != -1;
    })


    // add links between credit and debit if incomeParent specified
    // otherwise assume all transaction are debit and manually
    // generate an 'All debit' parent node.
    if (typeof(incomeParent) !== 'undefined') {
        for (var group in debitSum) {
            links.push({
                'source': '_'+incomeParent,
                'target': '_'+group,
                'value': debitSum[group]
            })
        }
    } else {
        for (var group in debitSum) {
            links.push({
                'source': 'All debit',
                'target': '_'+group,
                'value': debitSum[group]
            })
        }
        nodes.push({'name':'All debit'})
    }

    return {'nodes':nodes, 'links':links}
}
