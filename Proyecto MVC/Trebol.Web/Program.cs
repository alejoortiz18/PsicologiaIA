using Trebol.Web.DependencyContainer;

var builder = WebApplication.CreateBuilder(args);

// ── Registro centralizado de dependencias ─────────────────────────────────
builder.Services.DependencyInjection(builder.Configuration);

var app = builder.Build();

// ── Pipeline HTTP ─────────────────────────────────────────────────────────
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Landing/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();  // ← primero authentication
app.UseSession();         // ← sesión
app.UseAuthorization();   // ← luego authorization

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Landing}/{action=Index}/{id?}");

app.MapHub<Trebol.Web.Hubs.ChatHub>("/hubs/chat");
app.MapHub<Trebol.Web.Hubs.ConferenciaHub>("/hubs/conferencia");
app.MapHub<Trebol.Web.Hubs.CitaSalaHub>("/hubs/cita-sala");

app.Run();
