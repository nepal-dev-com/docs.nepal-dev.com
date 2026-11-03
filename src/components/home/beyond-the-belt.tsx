import Link from 'next/link';
import { privateProjects, type PrivateProject } from './private-projects';

// Seeded, so the belt is the same on every build.
function belt(count: number) {
  let state = 7;
  const next = () => (state = (state * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: count }, () => {
    const x = next() * 1000;
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round((35 + (next() - 0.5) * 50 * Math.sin((x / 1000) * Math.PI)) * 10) / 10,
      r: Math.round((0.5 + next() * 1.6) * 100) / 100,
      o: Math.round((0.25 + next() * 0.5) * 100) / 100,
    };
  });
}

const rocks = belt(220);

function Belt() {
  return (
    <div className="belt" aria-hidden>
      <svg viewBox="0 0 1000 70" preserveAspectRatio="none">
        <line x1="0" y1="35" x2="1000" y2="35" stroke="var(--home-line)" />
        {rocks.map((rock, index) => (
          <circle key={index} cx={rock.x} cy={rock.y} r={rock.r} fill="var(--home-faint)" opacity={rock.o} />
        ))}
      </svg>
    </div>
  );
}

function NightPlanet({ index }: { index: number }) {
  return (
    <svg viewBox="-28 -28 56 56" className="priv-planet" aria-hidden>
      <ellipse rx="25" ry="8" transform="rotate(-18)" fill="none" stroke="var(--home-line-2)" strokeDasharray="2 3" />
      <circle r="13" fill="var(--home-night)" stroke="var(--home-line-2)" />
      <path d={`M0-13a13 13 0 0 1 0 26a${5 + index * 2} 13 0 0 0 0-26Z`} fill="var(--home-faint)" opacity="0.7" />
    </svg>
  );
}

function Lock() {
  return (
    <svg viewBox="0 0 24 24" className="priv-lock" role="img" aria-label="private">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PrivateCard({ project, index }: { project: PrivateProject; index: number }) {
  return (
    <article className="priv">
      <NightPlanet index={index} />
      <div>
        <h3>
          <Link href={`/${project.slug}`}>{project.slug}</Link>
          <Lock />
        </h3>
        <p>{project.description}</p>
        <small>
          {project.audience} · {project.tracks}
        </small>
      </div>
    </article>
  );
}

/**
 * Private projects, beyond the belt (ADR-0017 decision 4). Everyone sees the group until the
 * sign-in ADR moves it behind a session read in a `<Suspense>` boundary (ADR-0016 decision 5).
 */
export function PrivateProjects({ projects = privateProjects }: { projects?: PrivateProject[] }) {
  return (
    <section className="private" id="private" aria-labelledby="private-heading">
      <Belt />
      <div className="private-head">
        <h2 id="private-heading">Private projects</h2>
        <p>Client and internal work. The pages stay private; only their names orbit here.</p>
      </div>
      {projects.length > 0 ? (
        <div className="priv-grid">
          {projects.map((project, index) => (
            <PrivateCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      ) : (
        <div className="priv-empty">
          <svg viewBox="0 0 120 70" aria-hidden>
            <ellipse cx="60" cy="35" rx="54" ry="20" fill="none" stroke="var(--home-line-2)" strokeDasharray="3 4" />
            <circle cx="60" cy="35" r="3" fill="var(--home-faint)" />
          </svg>
          <p>
            <b>No private projects in orbit yet.</b> They&apos;ll appear here once private documentation is set up.
          </p>
        </div>
      )}
    </section>
  );
}
