function handleFiles(file) {
    var tmp = Papa.parse(file,{
        header: true,
        complete: function (results) { render(results.data) }
    })
}

function render(data_raw) {
    var width = 800,
    height = 800;

    var data = prepData(data_raw, 'Income');

    nv.addGraph(function() {

        function cleanName(name) {
            // parent nodes will have a prepended '_' on its name
            // to allow a child by the same name
            // this returns any node name with the removed '_'
            // if it exists
            return name.substring(0,1) == '_' ? name.substring(1,name.length) : name
        }

        var chart = nv.models.sankeyChart()
            .width(width)
            .height(height)
            .nodeId(function(d) { return d.name })
            .nodeWidth(10)
            .nodePadding(10)
            .margin({left: 5})
            .linkTitle(function (d) {
                return '$' + d3.format(',.0f')(d.value)
            })
            .nodeStyle({
                title: function(d) {
                    return cleanName(d.name) + '\n' + '$' + d3.format(',.0f')(d.value);
                },
                label: function(d) {
                    return cleanName(d.name);
                },
                fillColor: function(d) {
                    var domain = [
                        'Income',
                        'Auto & Transport',
                        'Bills & Utilities',
                        'Business Services',
                        'Education',
                        'Entertainment',
                        'Fees & Charges',
                        'Financial',
                        'Food & Dining',
                        'Gifts & Donations',
                        'Health & Fitness',
                        'Home',
                        'Misc Expenses',
                        'Personal Care',
                        'Pets',
                        'Shopping',
                        'Taxes',
                        'Travel',
                        'Uncategorized',
                    ]
                    var color = d3.scale.category20()
                                  .domain(domain)

                    var name = cleanName(d.name);
                    if (d.sourceLinks.length === 0) {
                        // if child debit, grab parent name
                        name = cleanName(d.targetLinks[0].source.name);
                    } else if (d['Transaction Type'] == 'credit') {
                        name = 'Income';
                    }

                    return color(name)
                }
            })

        d3.select('#sankey')
            .attr('width', width)
            .attr('height', height)
            .datum(data)
            .call(chart);

        return chart;
    });
}
