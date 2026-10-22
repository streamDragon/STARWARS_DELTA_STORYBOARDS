using System;
using System.Collections.Generic;

namespace STARWARS_DELTA.Cutscenes.Editor
{
    // Pure planning data; one-way recipe, never a persistent Unity scene attachment.
    internal sealed class MY_CinematicIdeaBrief
    {
        public string Archetype = "FLEET_VOLLEY_22";
        public string Text = "";
        public double DurationSeconds = 22;
        public string AttackerId = "";
        public string EscortId = "";
        public string TargetId = "";
        public int Seed = 0;
    }
    internal sealed class MY_CinematicComposerDiagnostic
    {
        public string Code;
        public string Message;
        public string ShotId;
        public MY_CinematicComposerDiagnostic(string code, string message, string shotId = "")
        { Code = code; Message = message; ShotId = shotId; }
    }
    internal sealed class MY_CinematicShotPlan
    {
        public MY_CinematicIdeaBrief Brief;
        public readonly List<MY_CinematicShot> Shots = new List<MY_CinematicShot>();
    }
    internal sealed class MY_CinematicShot
    {
        public string Id;
        public double Start;
        public double Duration;
        public MY_CinematicCamera Camera;
        public string DramaticFunction;
        public string StoryClaim;
    }
    internal sealed class MY_CinematicCamera
    {
        public string Framing;
        public string Movement;
        public string Subject;
        public string Direction = "";
    }
    internal sealed class MY_CinematicPoint
    {
        public double X;
        public double Y;
        public MY_CinematicPoint(double x, double y) { X=x; Y=y; }
    }
    internal sealed class MY_CinematicVisible
    {
        public string Id;
        public string Role="ship";
        public double ScreenX;
        public double ScreenY;
        public double ScreenWidthFraction;
        public string Depth="mid";
        public string Saliency="primary";
        public MY_CinematicVisible(string id, double x, double y, double width, string depth="mid")
        { Id=id;ScreenX=x;ScreenY=y;ScreenWidthFraction=width;Depth=depth; }
    }
    internal sealed class MY_CinematicAction
    {
        public string Type;
        public string Subject;
        public string Target="";
        public string MotionIntent="";
        public string Speed="";
        public string ProjectileId="";
        public string ImpactMode="";
        public double StartOffset;
        public double Duration;
        public bool NeedsMuzzle;
        public bool NeedsImpactAnchor;
        public readonly List<MY_CinematicPoint> PathPoints=new List<MY_CinematicPoint>();
    }
    internal sealed class MY_CinematicBeat
    {
        public string Id;
        public double Start;
        public double Duration;
        public string StoryClaim;
        public string DramaticFunction;
        public MY_CinematicCamera Camera;
        public readonly List<MY_CinematicVisible> Visible=new List<MY_CinematicVisible>();
        public readonly List<MY_CinematicAction> Actions=new List<MY_CinematicAction>();
        public readonly List<string> VisualRequirements=new List<string>();
        public bool VisualVerified=false;
    }
}
