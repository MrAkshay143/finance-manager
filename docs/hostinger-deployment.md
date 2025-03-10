# Deploying Finance Manager on Hostinger

This guide will walk you through the process of deploying the Finance Manager application on Hostinger web hosting.

## Prerequisites

- A Hostinger hosting account (Shared or Business Plan)
- Domain configured (e.g., erp.imakshay.in)
- Access to Hostinger cPanel or hPanel
- FTP client (like FileZilla) or knowledge of using cPanel File Manager

## Deployment Steps

### Step 1: Prepare Your Application Files

1. Download the latest release of Finance Manager from GitHub
2. Extract the files on your local computer
3. Make sure your `.env` files do not contain sensitive development information

### Step 2: Create a MySQL Database

1. Log in to your Hostinger control panel
2. Navigate to **Databases** > **MySQL Databases**
3. Create a new database:
   - Enter a database name (e.g., `finance_db`)
   - Click **Create**
4. Create a database user:
   - Enter a username (e.g., `finance_user`)
   - Enter a strong password
   - Click **Create**
5. Assign the user to the database:
   - Select the database and user you just created
   - Grant all privileges
   - Click **Add**
6. Note the database details:
   - Database Name
   - Username
   - Password
   - Host (usually `localhost`)

### Step 3: Upload Application Files

#### Method 1: Using cPanel File Manager

1. Log in to your Hostinger cPanel
2. Navigate to **Files** > **File Manager**
3. Go to the `public_html` directory (or a subdirectory if you're not installing at the root level)
4. Click **Upload**
5. Upload all the files and folders from your Finance Manager application

#### Method 2: Using FTP Client

1. Connect to your hosting account using FTP credentials:
   - Host: Your domain (e.g., `ftp.erp.imakshay.in`)
   - Username: Your Hostinger FTP username
   - Password: Your Hostinger FTP password
   - Port: 21 (or as specified by Hostinger)
2. Navigate to the `public_html` directory
3. Upload all the files and folders from your Finance Manager application

### Step 4: Setting Permissions

1. Set the following directories to be writable:
   ```
   backend/database/
   backend/uploads/
   backend/logs/
   ```
2. Using File Manager:
   - Right-click on each directory
   - Select **Permissions**
   - Set permissions to `755` for directories
   - Set permissions to `644` for files
3. Using FTP client:
   - Right-click on each directory
   - Select **File Permissions**
   - Set to `755` for directories and `644` for files

### Step 5: Run the Setup Wizard

1. Open your domain in a web browser (e.g., `https://erp.imakshay.in/setup`)
2. Follow the setup wizard steps:

   a. **Check System Requirements**:

   - The wizard will verify if your hosting meets all requirements
   - Ensure PHP 8.0+ and MySQL 5.7+ are available

   b. **Database Configuration**:

   - Enter the database details you created in Step 2
   - Database Host: `localhost` (in most cases)
   - Database Name: `finance_db` (or the name you chose)
   - Database User: `finance_user` (or the username you chose)
   - Database Password: The password you created
   - Click **Test Connection** to verify

   c. **Site Configuration**:

   - Enter your site name (e.g., `Finance Manager`)
   - Enter your site URL (e.g., `https://erp.imakshay.in`)
   - Create admin account:
     - Username (e.g., `admin`)
     - Email (your email address)
     - Password (create a strong password)

   d. **Complete Setup**:

   - Review all information
   - Click **Complete Setup**

### Step 6: Post-Installation Configuration

#### Configure PHP Settings (if needed)

If you experience any issues with PHP settings, you may need to create or modify a `.htaccess` file in your `public_html` directory:

```
# PHP Settings
php_value upload_max_filesize 64M
php_value post_max_size 64M
php_value max_execution_time 300
php_value max_input_time 300
php_value memory_limit 256M

# Rewrite Rules for Next.js
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Handle Next.js client-side routing
  RewriteRule ^_next/(.*)$ _next/$1 [L]
  RewriteRule ^public/(.*)$ public/$1 [L]

  # Send all non-file/directory requests to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php [L]
</IfModule>
```

#### Set Up SSL (if not already configured)

1. In Hostinger cPanel, navigate to **SSL/TLS Status**
2. Click **Install Certificate** next to your domain
3. Wait for the SSL to be installed and activated

### Step 7: Verify Installation

1. Visit your domain (e.g., `https://erp.imakshay.in`)
2. Log in with the admin credentials you created during setup
3. Verify that all features are working correctly:
   - Dashboard loads properly
   - Can create ledgers
   - Can add transactions
   - Reports generate correctly

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to the database during setup  
**Solution**:

- Verify database credentials are correct
- Check if the database user has proper permissions
- Ensure the hostname is correct (usually `localhost`)

### File Permission Issues

**Problem**: "Permission denied" errors in logs  
**Solution**:

- Check directory permissions for `backend/database/`, `backend/uploads/`, and `backend/logs/`
- Set permissions to `755` for directories and `644` for files
- For persistent issues, contact Hostinger support to check hosting account settings

### PHP Version Issues

**Problem**: Application throws errors related to PHP version  
**Solution**:

- Check your PHP version in Hostinger cPanel
- Navigate to **PHP Configuration** and select PHP 8.0 or higher
- Create a PHP selector file if needed

### Blank Page or 500 Error

**Problem**: Site shows a blank page or 500 error  
**Solution**:

- Check PHP error logs in cPanel
- Ensure all required PHP extensions are enabled
- Verify `.htaccess` file is correctly configured
- Check file permissions

## Maintaining Your Installation

### Regular Backups

1. Use the built-in backup feature in Finance Manager
2. Additionally, create regular backups through Hostinger cPanel:
   - Navigate to **Files** > **Backup**
   - Generate a full backup or partial backups
   - Download and store these backups securely

### Updating the Application

When a new version is released:

1. Create a backup of your current installation and database
2. Download the new version
3. Replace the files on your server, preserving your `.env` files
4. Run any database migrations if required

## Support and Resources

- For application-specific issues, refer to the [main documentation](../README.md)
- For hosting-related issues, contact [Hostinger Support](https://www.hostinger.com/support)
- For bugs and features, visit the [GitHub Issues page](https://github.com/MrAkshay143/finance-manager/issues)
