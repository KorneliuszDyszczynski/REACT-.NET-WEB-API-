using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZadanieRekrutacyjne.Server.Context;
using ZadanieRekrutacyjne.Server.Dtos;
using ZadanieRekrutacyjne.Server.Entities;

namespace ZadanieRekrutacyjne.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateUpdateTaskDto dto)
        {
            var newTask = new TaskEntity()
            {
                StartDate = dto.StartDate,
                Interval = dto.Interval,
                TaskDay = dto.TaskDay
            };
            await _context.Tasks.AddAsync(newTask);
            await _context.SaveChangesAsync();

            return Ok("Task Added Successsfully");
        }

        [HttpGet]
        public async Task<ActionResult<List<TaskEntity>>> GetTasks()
        {
            var tasks = await _context.Tasks.ToListAsync(); 

            return Ok(tasks);
        }

    }
}
