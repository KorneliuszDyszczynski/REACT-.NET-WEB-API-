using Microsoft.EntityFrameworkCore;
using ZadanieRekrutacyjne.Server.Entities;

namespace ZadanieRekrutacyjne.Server.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<TaskEntity> Tasks { get; set; }
    }
}
