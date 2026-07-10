using System;
namespace Trebol.Web.Helpers;

public static class EmailCta
{
    public static string Build(string href, string text)
    {
        if (string.IsNullOrEmpty(href)) href = "#";
        var safeHref = System.Net.WebUtility.HtmlEncode(href);
        var safeText = System.Net.WebUtility.HtmlEncode(text);
        return $"<a href=\"{safeHref}\" style=\"display:inline-block;background:#000000;color:#FFFFFF !important;font-size:1.1rem;font-weight:700;font-family:'Segoe UI',Arial,sans-serif;text-decoration:none;padding:18px 56px;border-radius:50px;letter-spacing:.5px;box-shadow:0 6px 20px rgba(0,0,0,.8);border:2px solid #FFFFFF;-webkit-appearance:none;-moz-appearance:none;appearance:none;\">{safeText}</a>";
    }
}
