// Script para crear el admin en la BD
// Ejecutar con: dotnet script o como proyecto console

using System;
using System.Security.Cryptography;
using Konscious.Security.Cryptography;
using Microsoft.Data.SqlClient;

const string password    = "Gm41l.C0m";
const string correo      = "psicologiatrevol@gmail.com";
const string nombre      = "Administrador Trebol";
const string connStr     = @"Server=DESKALEJO\SQLEXPRESS;Database=TrebolDB;Trusted_Connection=True;TrustServerCertificate=True;";

// Hash Argon2id igual que PasswordHelper.cs
var salt = new byte[32];
RandomNumberGenerator.Fill(salt);

var argon2 = new Argon2id(System.Text.Encoding.UTF8.GetBytes(password))
{
    Salt        = salt,
    Iterations  = 3,
    MemorySize  = 65536,
    DegreeOfParallelism = 4
};
var hash = argon2.GetBytes(32);

var combined = new byte[64];
Buffer.BlockCopy(salt, 0, combined, 0,  32);
Buffer.BlockCopy(hash, 0, combined, 32, 32);
var hashB64 = Convert.ToBase64String(combined);

using var conn = new SqlConnection(connStr);
conn.Open();

// Borrar admin previo si existe
using var del = new SqlCommand("DELETE FROM Administrador WHERE Correo = @Correo", conn);
del.Parameters.AddWithValue("@Correo", correo);
del.ExecuteNonQuery();

using var ins = new SqlCommand(
    "INSERT INTO Administrador (NombreCompleto, Correo, PasswordHash, Estado) VALUES (@Nombre, @Correo, @Hash, 1)", conn);
ins.Parameters.AddWithValue("@Nombre", nombre);
ins.Parameters.AddWithValue("@Correo", correo);
ins.Parameters.AddWithValue("@Hash",   hashB64);
ins.ExecuteNonQuery();

Console.WriteLine($"Admin creado: {correo}");
Console.WriteLine($"Hash: {hashB64}");
