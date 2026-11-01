# Finds the floating PIE window, pins it topmost without taking focus, prints its client rect in physical pixels.
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class W {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc p, IntPtr l);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr v);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int w, int cy, uint f);
  public static IntPtr Found = IntPtr.Zero;
  public static string Title = "";
  public static void Find() {
    EnumWindows((h, l) => {
      var s = new StringBuilder(512);
      GetWindowText(h, s, 512);
      if (IsWindowVisible(h) && s.ToString().Contains("NetMode:")) { Found = h; Title = s.ToString(); return false; }
      return true;
    }, IntPtr.Zero);
  }
}
"@
[W]::SetProcessDpiAwarenessContext([IntPtr](-4)) | Out-Null
[W]::Find()
if ([W]::Found -eq [IntPtr]::Zero) { Write-Output "NOT_FOUND"; exit 1 }
# HWND_TOPMOST=-1, SWP_NOSIZE|SWP_NOMOVE|SWP_NOACTIVATE = 0x13
[W]::SetWindowPos([W]::Found, [IntPtr](-1), 0, 0, 0, 0, 0x13) | Out-Null
$r = New-Object W+RECT
[W]::GetClientRect([W]::Found, [ref]$r) | Out-Null
$p = New-Object W+POINT
[W]::ClientToScreen([W]::Found, [ref]$p) | Out-Null
Write-Output "$($p.X) $($p.Y) $($r.R) $($r.B)"
