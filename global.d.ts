export {};

declare global {
  type ListingObject = {
    country: string;
    result_count: number;
    longitude: number;
    area_name: string;
    listing: (
      | {
          rental_prices: {
            shared_occupancy: string;
            per_week: number;
            accurate: string;
            per_month: number;
          };
          country_code: string;
          num_floors: number;
          view_count_30day: number;
          image_150_113_url: string;
          listing_status: string;
          num_bedrooms: number;
          location_is_approximate: number;
          image_50_38_url: string;
          latitude: number;
          view_count: number;
          furnished_state: string;
          agent_address: string;
          branch_id: string;
          category: string;
          property_type: string;
          deposit: string;
          images: {
            original: string;
            '480x360': string;
            '354x255': string;
            '645x430': string;
            '80x60': string;
            '768x576': string;
            '150x113': string;
            '1024x768': string;
            caption: string;
            '50x38': string;
            '240x180': string;
          }[];
          longitude: number;
          listing_date: string;
          thumbnail_url: string;
          description: string;
          agent_postcode: string;
          post_town: string;
          details_url: string;
          short_description: string;
          outcode: string;
          other_image: { url: string; description: string }[];
          image_645_430_url: string;
          title: string;
          county: string;
          price: string;
          is_premium_listing: number;
          available_from_display: string;
          listing_id: string;
          image_caption: string;
          bullet: string[];
          image_80_60_url: string;
          property_number: string;
          status: string;
          virtual_tour?: string[];
          agent_name: string;
          num_recepts: number;
          property_badge: string;
          country: string;
          council_tax_band: string;
          company_id: number;
          first_published_date: string;
          floor_plan?: string[];
          displayable_address: string;
          street_name: string;
          num_bathrooms: number;
          incode: string;
          featured_type: string;
          agent_logo: string;
          price_change: {
            direction: string;
            date: string;
            percent: string;
            price: number;
          }[];
          agent_phone: string;
          group_id: number;
          image_354_255_url: string;
          image_url: string;
          last_published_date: string;
          original_image: string[];
          last_sale_price?: undefined;
          last_sale_date?: undefined;
          letting_fees?: undefined;
          administration_fees?: undefined;
          property_id?: undefined;
        }
      | {
          last_sale_price: number;
          rental_prices: {
            shared_occupancy: string;
            per_week: number;
            accurate: string;
            per_month: number;
          };
          country_code: string;
          num_floors: number;
          view_count_30day: number;
          image_150_113_url: string;
          listing_status: string;
          num_bedrooms: number;
          location_is_approximate: number;
          image_50_38_url: string;
          latitude: number;
          view_count: number;
          furnished_state: string;
          agent_address: string;
          branch_id: string;
          category: string;
          property_type: string;
          last_sale_date: string;
          letting_fees: string;
          images: {
            original: string;
            '480x360': string;
            '354x255': string;
            '645x430': string;
            '80x60': string;
            '768x576': string;
            '150x113': string;
            '1024x768': string;
            caption: string;
            '50x38': string;
            '240x180': string;
          }[];
          longitude: number;
          listing_date: string;
          thumbnail_url: string;
          description: string;
          agent_postcode: string;
          post_town: string;
          details_url: string;
          short_description: string;
          outcode: string;
          other_image: { url: string; description: string }[];
          image_645_430_url: string;
          title: string;
          county: string;
          price: string;
          is_premium_listing: number;
          available_from_display: string;
          listing_id: string;
          image_caption: string;
          bullet: string[];
          image_80_60_url: string;
          property_number: string;
          status: string;
          virtual_tour?: string[];
          agent_name: string;
          num_recepts: number;
          administration_fees: string;
          property_badge: string;
          country: string;
          company_id: number;
          property_id: number;
          first_published_date: string;
          floor_plan?: string[];
          displayable_address: string;
          street_name: string;
          num_bathrooms: number;
          incode: string;
          featured_type: string;
          agent_logo: string;
          price_change: {
            direction: string;
            date: string;
            percent: string;
            price: number;
          }[];
          agent_phone: string;
          group_id: number;
          image_354_255_url: string;
          image_url: string;
          last_published_date: string;
          original_image: string[];
          deposit?: undefined;
          council_tax_band?: undefined;
        }
    )[];
    street: string;
    town: string;
    latitude: number;
    county: string;
    bounding_box: {
      longitude_min: string;
      latitude_min: string;
      longitude_max: string;
      latitude_max: string;
    };
    postcode: string;
  };

  type Listing =
    | {
        rental_prices: {
          shared_occupancy: string;
          per_week: number;
          accurate: string;
          per_month: number;
        };
        country_code: string;
        num_floors: number;
        view_count_30day: number;
        image_150_113_url: string;
        listing_status: string;
        num_bedrooms: number;
        location_is_approximate: number;
        image_50_38_url: string;
        latitude: number;
        view_count: number;
        furnished_state: string;
        agent_address: string;
        branch_id: string;
        category: string;
        property_type: string;
        deposit: string;
        images: {
          original: string;
          '480x360': string;
          '354x255': string;
          '645x430': string;
          '80x60': string;
          '768x576': string;
          '150x113': string;
          '1024x768': string;
          caption: string;
          '50x38': string;
          '240x180': string;
        }[];
        longitude: number;
        listing_date: string;
        thumbnail_url: string;
        description: string;
        agent_postcode: string;
        post_town: string;
        details_url: string;
        short_description: string;
        outcode: string;
        other_image: { url: string; description: string }[];
        image_645_430_url: string;
        title: string;
        county: string;
        price: string;
        is_premium_listing: number;
        available_from_display: string;
        listing_id: string;
        image_caption: string;
        bullet: string[];
        image_80_60_url: string;
        property_number: string;
        status: string;
        virtual_tour?: string[];
        agent_name: string;
        num_recepts: number;
        property_badge: string;
        country: string;
        council_tax_band: string;
        company_id: number;
        first_published_date: string;
        floor_plan?: string[];
        displayable_address: string;
        street_name: string;
        num_bathrooms: number;
        incode: string;
        featured_type: string;
        agent_logo: string;
        price_change: {
          direction: string;
          date: string;
          percent: string;
          price: number;
        }[];
        agent_phone: string;
        group_id: number;
        image_354_255_url: string;
        image_url: string;
        last_published_date: string;
        original_image: string[];
        last_sale_price?: undefined;
        last_sale_date?: undefined;
        letting_fees?: undefined;
        administration_fees?: undefined;
        property_id?: undefined;
      }
    | {
        last_sale_price: number;
        rental_prices: {
          shared_occupancy: string;
          per_week: number;
          accurate: string;
          per_month: number;
        };
        country_code: string;
        num_floors: number;
        view_count_30day: number;
        image_150_113_url: string;
        listing_status: string;
        num_bedrooms: number;
        location_is_approximate: number;
        image_50_38_url: string;
        latitude: number;
        view_count: number;
        furnished_state: string;
        agent_address: string;
        branch_id: string;
        category: string;
        property_type: string;
        last_sale_date: string;
        letting_fees: string;
        images: {
          original: string;
          '480x360': string;
          '354x255': string;
          '645x430': string;
          '80x60': string;
          '768x576': string;
          '150x113': string;
          '1024x768': string;
          caption: string;
          '50x38': string;
          '240x180': string;
        }[];
        longitude: number;
        listing_date: string;
        thumbnail_url: string;
        description: string;
        agent_postcode: string;
        post_town: string;
        details_url: string;
        short_description: string;
        outcode: string;
        other_image: { url: string; description: string }[];
        image_645_430_url: string;
        title: string;
        county: string;
        price: string;
        is_premium_listing: number;
        available_from_display: string;
        listing_id: string;
        image_caption: string;
        bullet: string[];
        image_80_60_url: string;
        property_number: string;
        status: string;
        virtual_tour?: string[];
        agent_name: string;
        num_recepts: number;
        administration_fees: string;
        property_badge: string;
        country: string;
        company_id: number;
        property_id: number;
        first_published_date: string;
        floor_plan?: string[];
        displayable_address: string;
        street_name: string;
        num_bathrooms: number;
        incode: string;
        featured_type: string;
        agent_logo: string;
        price_change: {
          direction: string;
          date: string;
          percent: string;
          price: number;
        }[];
        agent_phone: string;
        group_id: number;
        image_354_255_url: string;
        image_url: string;
        last_published_date: string;
        original_image: string[];
        deposit?: undefined;
        council_tax_band?: undefined;
      };

  type AutocompleteObject = {
    area_name: string;
    street: string;
    suggestions: {
      identifier: string;
      value: string;
    }[];
    county: string;
    town: string;
    postcode: string;
  };

  type AutocompleteSuggestion = {
    identifier: string;
    value: string;
  };

  export type User = {
    id: number;
    username: string;
    twofaSecret?: string;
    twofaUnixT0?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  export type UserWithPasswordHash = User & { passwordHash: string };

  export type Profile = {
    id: number;
    profileType: string;
    roleId: number;
    userIds: string;
  };

  export type AccessToken = {
    id: number;
    token: string;
    userId: number;
  };

  export type RefreshToken = {
    id: number;
    token: string;
    wasUsed: boolean;
    userId: number;
  };

  export type CsrfSalt = {
    id: number;
    salt: string;
  };

  export type TwoFaData = {
    twofaSecret: string;
    twofaUnixT0: number;
  };

  export type TwoFaEnabled = {
    userId: number;
    has2Fa: boolean;
    twofaTimeoutUntil: number;
  };

  export type Settings = {
    userId: number;
    has2Fa: boolean;
    twofaTimeoutUntil: number;
  };

  export type TotpResponseBody =
    | { errors: { message: string }[] }
    | { password: number[] | number };

  export type SearchParameters =
    | {
        averageRent: number;
        averageRooms: number;
      }
    | {
        averageSalePrice: number;
        averageRooms: number;
      };

  export type RentParameters = {
    averageRent: number;
    averageRooms: number;
  };

  export type SaleParameters = {
    averageSalePrice: number;
    averageRooms: number;
  };
}
