# Overview

For smaller migrations (think thousands/tens of thousands of assets) you can consider running the script from your laptop.

For larger migrations (think hundreds of thousands of assets) it is best to run the script from a virtual machine.

# Provisioning a virtual machine runtime - guidelines

- ❗️IMPORTANT
    * If you plan to run the script on a VM via SSH connection - make sure to use terminal multiplexer (like `screen` or `tmux`)
        + If you do not use multiplexer - you risk the migration process to be terminated if SSH connection is closed and your VM session is terminated 
- ⚙️ CPU / Memory
    * The script does not require lots of resources (most of work is "delegated" to Cloudinary back-end systems)
    * For example, `t2.micro` VM hosted with AWS is sufficient
- 💾 Storage
    * Rule of thumb for estimating migration log file size - ~300MB per 100000 assets migrated (may be more if you pass lots of taxonomy data)
    * That's because each log file record contains the followind data (to aid troubleshooting if necessary):
        + All fields from the input CSV file record
        + Cloudinary API payload it was "translated" to
        + API response 
      
# Deploying script into the runtime

- 🍴 We recommend to start by forking this repository
    * That way you can maintain your customizations and history of changes for future reference if necessary
- 👯 Clone the (forked) repository into the VM
- 🛠️ Install the nodejs (using [Node Version Management shell script](https://github.com/nvm-sh/nvm) is, probably, the easiest way)
- 📚 Install migration script dependencies
    * Open terminal shell
    * Navigate to the folder you cloned the (forked) repository into (you should see `package.json` file in that folder)
    * Execute the `npm install` from the folder
        + This will prompt Node Package Manager to fetch and install all the packages required by the migration script

