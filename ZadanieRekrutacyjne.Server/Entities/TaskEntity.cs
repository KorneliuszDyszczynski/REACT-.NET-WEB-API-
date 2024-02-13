using System.ComponentModel.DataAnnotations;

namespace ZadanieRekrutacyjne.Server.Entities
{
    public class TaskEntity
    {
        [Key]
        public int Id { get; set; }

        public DateTime StartDate { get; set; }

        public string? TaskDay { get; set; }

        public uint Interval { get; set; }
    }
}
