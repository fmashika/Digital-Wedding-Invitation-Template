import { useEffect, useState } from 'react';
import {
  APILoadingStatus,
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';

const VENUE_ADDRESS = '4800 N Sabino Canyon Rd, Tucson, AZ';
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  VENUE_ADDRESS
)}`;

interface ResolvedVenueLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId?: string;
}

function VenueMapContent({
  initialLocation,
}: {
  initialLocation: ResolvedVenueLocation | null;
}) {
  const status = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');
  const [venueLocation, setVenueLocation] =
    useState<ResolvedVenueLocation | null>(initialLocation);
  const [lookupError, setLookupError] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    if (initialLocation) {
      setVenueLocation(initialLocation);
      setLookupError(false);
    }
  }, [initialLocation]);

  // Fallback to Places API (New) via JS SDK if server geocoding did not resolve coordinates
  useEffect(() => {
    if (venueLocation || !placesLib) return;
    let cancelled = false;

    type PlaceSearchMatch = {
      id?: string | null;
      formattedAddress?: string | null;
      location?: { lat: () => number; lng: () => number } | null;
    };

    (
      placesLib.Place as unknown as {
        searchByText: (req: {
          textQuery: string;
          fields: string[];
          maxResultCount: number;
        }) => Promise<{ places?: PlaceSearchMatch[] }>;
      }
    )
      .searchByText({
        textQuery: VENUE_ADDRESS,
        fields: ['id', 'displayName', 'formattedAddress', 'location'],
        maxResultCount: 1,
      })
      .then(({ places }) => {
        if (cancelled) return;
        const match = places?.[0];
        const loc = match?.location;
        if (loc) {
          setVenueLocation({
            lat: loc.lat(),
            lng: loc.lng(),
            formattedAddress: match.formattedAddress ?? VENUE_ADDRESS,
            placeId: match.id ?? undefined,
          });
          setLookupError(false);
        } else {
          setLookupError(true);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = String(err);
        if (
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('QuotaExceeded')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setLookupError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [placesLib, venueLocation]);

  if (
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE ||
    lookupError
  ) {
    return (
      <div className="h-[300px] sm:h-[340px] w-full flex flex-col items-center justify-center bg-[#F4F7FA] px-6 text-center">
        <MapPin className="w-7 h-7 text-[#5B7A96] mb-2.5" />
        <p className="font-display text-2xl text-[#1A2B3C]">Opal Retreat</p>
        <p className="mt-1 text-sm text-[#425569]">{VENUE_ADDRESS}</p>
        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-[#23374B] text-white text-xs font-medium hover:bg-[#1A2B3C] transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Open Directions in Google Maps
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  if (!venueLocation) {
    return (
      <div className="h-[300px] sm:h-[340px] w-full flex items-center justify-center bg-[#F4F7FA] text-xs font-medium text-[#53667A]">
        Locating Opal Retreat on Google Maps...
      </div>
    );
  }

  const mapsPlaceUrl = venueLocation.placeId
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        venueLocation.formattedAddress
      )}&query_place_id=${encodeURIComponent(venueLocation.placeId)}`
    : DIRECTIONS_URL;

  return (
    <div className="h-[300px] sm:h-[340px] w-full">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={{ lat: venueLocation.lat, lng: venueLocation.lng }}
        defaultZoom={14}
        gestureHandling="cooperative"
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={true}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
      >
        <AdvancedMarker
          ref={markerRef}
          position={{ lat: venueLocation.lat, lng: venueLocation.lng }}
          title="Opal Retreat · Wedding Ceremony & Reception"
          onClick={() => setInfoOpen((prev) => !prev)}
        >
          <Pin
            background="#23374B"
            borderColor="#1A2B3C"
            glyphColor="#F8FAFC"
            scale={1.15}
          />
        </AdvancedMarker>

        {infoOpen && marker && (
          <InfoWindow
            anchor={marker}
            maxWidth={250}
            onCloseClick={() => setInfoOpen(false)}
          >
            <div className="py-0.5 pr-1 text-[#1A2B3C]">
              <p className="font-display text-lg font-semibold leading-tight">
                Opal Retreat
              </p>
              <p className="mt-1 text-xs text-[#425569] leading-snug">
                {venueLocation.formattedAddress}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#53667A]">
                Dec 11, 2027 · Ceremony 2:00 PM MST
              </p>
              <a
                href={mapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#23374B] hover:underline underline-offset-2"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export function VenueMap() {
  const [apiKey, setApiKey] = useState<string>(
    () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
  );
  const [configLoaded, setConfigLoaded] = useState<boolean>(
    Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  );
  const [initialLocation, setInitialLocation] =
    useState<ResolvedVenueLocation | null>(null);

  useEffect(() => {
    let active = true;

    const loadMapsSetup = async () => {
      try {
        if (!apiKey) {
          const cfgRes = await fetch('/api/maps-config');
          if (cfgRes.ok) {
            const cfg = (await cfgRes.json()) as { apiKey?: string };
            if (active && cfg.apiKey) {
              setApiKey(cfg.apiKey);
            }
          }
        }

        const geoRes = await fetch('/api/venue-location');
        const geoData = (await geoRes.json()) as {
          error?: string;
          lat?: number;
          lng?: number;
          formattedAddress?: string;
          placeId?: string;
        };

        if (geoRes.status === 429 || geoData?.error === 'RESOURCE_EXHAUSTED') {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        } else if (
          active &&
          geoRes.ok &&
          typeof geoData.lat === 'number' &&
          typeof geoData.lng === 'number'
        ) {
          setInitialLocation({
            lat: geoData.lat,
            lng: geoData.lng,
            formattedAddress: geoData.formattedAddress ?? VENUE_ADDRESS,
            placeId: geoData.placeId,
          });
        }
      } catch {
        // Fallback handled inside VenueMapContent or fallback card
      } finally {
        if (active) setConfigLoaded(true);
      }
    };

    void loadMapsSetup();
    return () => {
      active = false;
    };
  }, [apiKey]);

  return (
    <div className="rounded-2xl border border-[#DCE4EC] bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-[#DCE4EC] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#53667A]">
            Ceremony Venue Location
          </p>
          <h3 className="font-display text-2xl text-[#1A2B3C]">
            Opal Retreat · Tucson, Arizona
          </h3>
        </div>
        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg border border-[#DCE4EC] bg-white hover:bg-[#EEF3F7] text-xs font-medium text-[#23374B] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Get Directions</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {!configLoaded ? (
        <div className="h-[300px] sm:h-[340px] w-full flex items-center justify-center bg-[#F4F7FA] text-xs font-medium text-[#53667A]">
          Loading venue map...
        </div>
      ) : !apiKey ? (
        <div className="h-[300px] sm:h-[340px] w-full flex flex-col items-center justify-center bg-[#F4F7FA] px-6 text-center">
          <MapPin className="w-7 h-7 text-[#5B7A96] mb-2.5" />
          <p className="font-display text-2xl text-[#1A2B3C]">Opal Retreat</p>
          <p className="mt-1 text-sm text-[#425569]">{VENUE_ADDRESS}</p>
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-[#23374B] text-white text-xs font-medium hover:bg-[#1A2B3C] transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            Open Directions in Google Maps
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <APIProvider
          apiKey={apiKey}
          libraries={['marker', 'places']}
          language="en"
          region="US"
        >
          <VenueMapContent initialLocation={initialLocation} />
        </APIProvider>
      )}
    </div>
  );
}
