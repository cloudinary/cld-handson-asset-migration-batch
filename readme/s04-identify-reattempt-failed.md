Oftentimes you may run into situations where some of the assets failed to migrate (will be reported by the tool)  

You can then use any data manipulation software you are familiar with (Excel, pandas with Python, PowerShell, etc) with the migration report to
- Filter out the assets that failed to migrate
- Investigate typical causes for the migration issues
- Address the causes behind the failure and prepare a new input CSV file with only the assets that need to be re-attempted

This toolset can then further be leveraged to
- Run the migration flow for the assets to be re-attempted and obtain the migration report
