function prepData(dat) {

    var nodes = [], links = [];
    var debitSum = {};

    // Groups will define how transaction are grouped.
    // Any categories not listed here, but which are part of the
    // input data will be ignored.
    // Any transaction with a parent category (e.g. Entertainment) will
    // automatically be placed into that parent category (i.e. the transactions
    // will look like Entertainment -> Entertainment)
    var groups = {
        "EBIT": ['Income', 'Interest Income', 'Freelance', 'Reimbursement', 'Paycheck'],
        'Auto & Transport': ['Gas & Fuel','Parking','Service & Parts','Public Transportation','Auto Insurance','Auto Payment'],
        'Bills & Utilities': ['Internet','Utilities','Mobile Phone','Rent','Home Phone','Mortgage & Rent'],
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
                        .rollup(function(group) { return d3.sum(group, function(d) { return d.Amount})})
                        .entries(filtered)

        // sup value for parent debit group
        // in order to make the link between
        // debit and credit
        if (type == 'debit') {
            debitSum[group] = d3.sum(nested, function(d) { return d.values })
        }

        // generate nodes
        // some transactions may be categorized by the parent category
        // (e.g. Bill & Utilities), therefore we append a '_' to the
        // parent category to make it distinct, this acts as the source
        // for a transaction
        nodes.push({'name': '_'+group})
        nested.forEach(function (d) {
            nodes.push({'name': d.key})
        })

        // generate links
        nested.forEach(function (d) {
            links.push({
                'target': type == 'debit' ? d.key : '_'+group,
                'source': type == 'credit' ? d.key : '_'+group,
                'value': d.values
            })
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

    // add links between credit and debit
    for (var group in debitSum) {
        links.push({
            'source': '_EBIT',
            'target': '_'+group,
            'value': debitSum[group]
        })
    }

    return {'nodes':nodes, 'links':links}
}
