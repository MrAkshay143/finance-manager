/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Auth endpoints
      {
        source: '/api/auth/login',
        destination: 'http://localhost:8000/api/auth/login.php',
      },
      {
        source: '/api/auth/check',
        destination: 'http://localhost:8000/api/auth/check.php',
      },
      {
        source: '/api/auth/register',
        destination: 'http://localhost:8000/api/auth/register.php',
      },
      {
        source: '/api/auth/logout',
        destination: 'http://localhost:8000/api/auth/logout.php',
      },
      
      // Profile endpoints
      {
        source: '/api/profile',
        destination: 'http://localhost:8000/api/profile/index.php',
      },
      
      // Ledger endpoints
      {
        source: '/api/ledgers',
        destination: 'http://localhost:8000/api/ledgers/index.php',
      },
      {
        source: '/api/ledgers/groups',
        destination: 'http://localhost:8000/api/ledgers/groups.php',
      },
      {
        source: '/api/ledgers/by-type/:type',
        destination: 'http://localhost:8000/api/ledgers/index.php?type=:type',
      },
      {
        source: '/api/ledgers/:id',
        destination: 'http://localhost:8000/api/ledgers/get.php?id=:id',
      },
      {
        source: '/api/ledgers/:id/update',
        destination: 'http://localhost:8000/api/ledgers/update.php?id=:id',
      },
      {
        source: '/api/ledgers/:id/delete',
        destination: 'http://localhost:8000/api/ledgers/delete.php?id=:id',
      },
      {
        source: '/api/ledgers/group/:id',
        destination: 'http://localhost:8000/api/ledgers/get-group.php?id=:id',
      },
      {
        source: '/api/ledgers/group/:id/update',
        destination: 'http://localhost:8000/api/ledgers/update-group.php?id=:id',
      },
      {
        source: '/api/ledgers/group/:id/delete',
        destination: 'http://localhost:8000/api/ledgers/delete-group.php?id=:id',
      },
      
      // Transaction endpoints
      {
        source: '/api/transactions',
        destination: 'http://localhost:8000/api/transactions/index.php',
      },
      {
        source: '/api/transactions/recent',
        destination: 'http://localhost:8000/api/transactions/index.php?limit=5',
      },
      {
        source: '/api/transactions/:id',
        destination: 'http://localhost:8000/api/transactions/get.php?id=:id',
      },
      {
        source: '/api/transactions/:id/update',
        destination: 'http://localhost:8000/api/transactions/update.php?id=:id',
      },
      {
        source: '/api/transactions/:id/delete',
        destination: 'http://localhost:8000/api/transactions/delete.php?id=:id',
      },
      
      // Report endpoints
      {
        source: '/api/reports/balance-sheet',
        destination: 'http://localhost:8000/api/reports/balance-sheet.php',
      },
      {
        source: '/api/reports/income-statement',
        destination: 'http://localhost:8000/api/reports/income-statement.php',
      },
      {
        source: '/api/reports/income-expense',
        destination: 'http://localhost:8000/api/reports/income-expense.php',
      },
      {
        source: '/api/reports/net-worth',
        destination: 'http://localhost:8000/api/reports/net-worth.php',
      },
      {
        source: '/api/reports/credit-card-dues',
        destination: 'http://localhost:8000/api/reports/credit-card-dues.php',
      },
      {
        source: '/api/reports/monthly-summary',
        destination: 'http://localhost:8000/api/reports/monthly-summary.php',
      },
      {
        source: '/api/reports/transaction-history',
        destination: 'http://localhost:8000/api/reports/transaction-history.php',
      },
      
      // Backup endpoints
      {
        source: '/api/backup',
        destination: 'http://localhost:8000/api/backup/index.php',
      },
      {
        source: '/api/backup/download',
        destination: 'http://localhost:8000/api/backup/download.php',
      },
      
      // Default API endpoint for any other route
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api.php',
      }
    ]
  },
  // Configure image domains if needed
  images: {
    domains: ['localhost'],
  },
  // Configure strict mode for React
  reactStrictMode: true,
};

export default nextConfig; 