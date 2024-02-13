namespace ZadanieRekrutacyjne.Server.Dtos
{
    public class CreateUpdateTaskDto
    {
        public DateTime StartDate { get; set; }

        public string? TaskDay { get; set; }

        public uint Interval { get; set; }
    }
}
