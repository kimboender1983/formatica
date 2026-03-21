<script setup lang="ts">
    import {
        AsYouType,
        type CountryCode,
        getCountries,
        getCountryCallingCode,
        parsePhoneNumber,
    } from "libphonenumber-js";
    import { computed, nextTick, onMounted, ref, watch } from "vue";

    const props = withDefaults(
        defineProps<{
            modelValue: string;
            defaultCountry?: string;
            countries?: string[];
            showDialCode?: boolean;
            placeholder?: string;
            disabled?: boolean;
        }>(),
        {
            defaultCountry: "US",
            showDialCode: true,
            disabled: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: string];
        blur: [event: FocusEvent];
    }>();

    // ---------------------------------------------------------------------------
    // Country data
    // ---------------------------------------------------------------------------

    interface CountryItem {
        code: CountryCode;
        name: string;
        dialCode: string;
        flag: string;
    }

    const countryNames: Record<string, string> = {
        AF: "Afghanistan",
        AL: "Albania",
        DZ: "Algeria",
        AD: "Andorra",
        AO: "Angola",
        AR: "Argentina",
        AM: "Armenia",
        AU: "Australia",
        AT: "Austria",
        AZ: "Azerbaijan",
        BH: "Bahrain",
        BD: "Bangladesh",
        BY: "Belarus",
        BE: "Belgium",
        BZ: "Belize",
        BJ: "Benin",
        BT: "Bhutan",
        BO: "Bolivia",
        BA: "Bosnia",
        BW: "Botswana",
        BR: "Brazil",
        BN: "Brunei",
        BG: "Bulgaria",
        BF: "Burkina Faso",
        BI: "Burundi",
        KH: "Cambodia",
        CM: "Cameroon",
        CA: "Canada",
        CL: "Chile",
        CN: "China",
        CO: "Colombia",
        CR: "Costa Rica",
        HR: "Croatia",
        CU: "Cuba",
        CY: "Cyprus",
        CZ: "Czechia",
        DK: "Denmark",
        DO: "Dominican Rep.",
        EC: "Ecuador",
        EG: "Egypt",
        SV: "El Salvador",
        EE: "Estonia",
        ET: "Ethiopia",
        FI: "Finland",
        FR: "France",
        GE: "Georgia",
        DE: "Germany",
        GH: "Ghana",
        GR: "Greece",
        GT: "Guatemala",
        HN: "Honduras",
        HK: "Hong Kong",
        HU: "Hungary",
        IS: "Iceland",
        IN: "India",
        ID: "Indonesia",
        IR: "Iran",
        IQ: "Iraq",
        IE: "Ireland",
        IL: "Israel",
        IT: "Italy",
        JM: "Jamaica",
        JP: "Japan",
        JO: "Jordan",
        KZ: "Kazakhstan",
        KE: "Kenya",
        KR: "South Korea",
        KW: "Kuwait",
        LV: "Latvia",
        LB: "Lebanon",
        LY: "Libya",
        LT: "Lithuania",
        LU: "Luxembourg",
        MO: "Macau",
        MY: "Malaysia",
        MX: "Mexico",
        MA: "Morocco",
        MZ: "Mozambique",
        MM: "Myanmar",
        NP: "Nepal",
        NL: "Netherlands",
        NZ: "New Zealand",
        NI: "Nicaragua",
        NG: "Nigeria",
        NO: "Norway",
        OM: "Oman",
        PK: "Pakistan",
        PA: "Panama",
        PY: "Paraguay",
        PE: "Peru",
        PH: "Philippines",
        PL: "Poland",
        PT: "Portugal",
        QA: "Qatar",
        RO: "Romania",
        RU: "Russia",
        SA: "Saudi Arabia",
        RS: "Serbia",
        SG: "Singapore",
        SK: "Slovakia",
        SI: "Slovenia",
        ZA: "South Africa",
        ES: "Spain",
        LK: "Sri Lanka",
        SE: "Sweden",
        CH: "Switzerland",
        TW: "Taiwan",
        TZ: "Tanzania",
        TH: "Thailand",
        TR: "Turkey",
        UA: "Ukraine",
        AE: "UAE",
        GB: "United Kingdom",
        US: "United States",
        UY: "Uruguay",
        VE: "Venezuela",
        VN: "Vietnam",
        ZW: "Zimbabwe",
    };

    function countryFlag(code: string): string {
        return code
            .toUpperCase()
            .split("")
            .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
            .join("");
    }

    const allCountries = computed<CountryItem[]>(() => {
        const codes = props.countries?.length
            ? props.countries.filter((c): c is CountryCode =>
                  getCountries().includes(c as CountryCode),
              )
            : getCountries();

        return codes
            .map((code) => ({
                code,
                name: countryNames[code] ?? code,
                dialCode: `+${getCountryCallingCode(code)}`,
                flag: countryFlag(code),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    });

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    const selectedCountry = ref<CountryCode>(props.defaultCountry as CountryCode);
    const nationalNumber = ref("");
    const dropdownOpen = ref(false);
    const search = ref("");
    const searchInputRef = ref<HTMLInputElement | null>(null);

    const filteredCountries = computed(() => {
        const q = search.value.toLowerCase();
        if (!q) return allCountries.value;
        return allCountries.value.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q) ||
                c.dialCode.includes(q),
        );
    });

    const selectedCountryData = computed(
        () =>
            allCountries.value.find((c) => c.code === selectedCountry.value) ??
            allCountries.value[0],
    );

    // ---------------------------------------------------------------------------
    // Sync model value
    // ---------------------------------------------------------------------------

    onMounted(() => {
        if (props.modelValue) parseIncoming(props.modelValue);
    });

    watch(
        () => props.modelValue,
        (val) => {
            if (val) parseIncoming(val);
        },
    );

    function parseIncoming(val: string) {
        try {
            const parsed = parsePhoneNumber(val);
            if (parsed?.country) {
                selectedCountry.value = parsed.country;
                nationalNumber.value = parsed.nationalNumber;
                return;
            }
        } catch {
            // Not a valid international number
        }
        nationalNumber.value = val.replace(/^\+\d+\s*/, "");
    }

    function emitValue() {
        if (!nationalNumber.value.trim()) {
            emit("update:modelValue", "");
            return;
        }
        const formatter = new AsYouType(selectedCountry.value);
        formatter.input(`+${getCountryCallingCode(selectedCountry.value)}${nationalNumber.value}`);
        const num = formatter.getNumber();
        emit("update:modelValue", num?.format("E.164") ?? nationalNumber.value);
    }

    function onInput(e: Event) {
        const target = e.target as HTMLInputElement;
        nationalNumber.value = target.value;
        emitValue();
    }

    function selectCountry(code: CountryCode) {
        selectedCountry.value = code;
        dropdownOpen.value = false;
        search.value = "";
        emitValue();
    }

    function openDropdown() {
        if (props.disabled) return;
        dropdownOpen.value = true;
        search.value = "";
        nextTick(() => searchInputRef.value?.focus());
    }

    function closeDropdown() {
        dropdownOpen.value = false;
        search.value = "";
    }
</script>

<template>
  <div class="relative">
    <div
      :class="[
        'flex items-stretch rounded-lg border transition-colors',
        disabled
          ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          : 'border-gray-300 dark:border-gray-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
      ]"
    >
      <!-- Country selector button -->
      <button
        v-if="showDialCode"
        type="button"
        :disabled="disabled"
        class="flex items-center gap-1.5 px-3 border-r border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
        @mousedown.prevent="dropdownOpen ? closeDropdown() : openDropdown()"
      >
        <span class="text-lg leading-none">{{ selectedCountryData?.flag }}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ selectedCountryData?.dialCode }}</span>
        <svg
          :class="['h-3 w-3 text-gray-400 transition-transform', dropdownOpen ? 'rotate-180' : '']"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <!-- Phone number input -->
      <input
        type="tel"
        :value="nationalNumber"
        :placeholder="placeholder || 'Phone number'"
        :disabled="disabled"
        autocomplete="tel-national"
        class="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none min-w-0"
        :class="showDialCode ? 'rounded-r-lg' : 'rounded-lg'"
        @input="onInput"
        @blur="emit('blur', $event)"
      />
    </div>

    <!-- Backdrop (invisible, closes dropdown on click) -->
    <div
      v-if="dropdownOpen"
      class="fixed inset-0 z-40"
      @mousedown="closeDropdown"
    />

    <!-- Country dropdown -->
    <div
      v-if="dropdownOpen"
      class="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden"
    >
      <!-- Search -->
      <div class="border-b border-gray-200 dark:border-gray-700 p-2">
        <input
          ref="searchInputRef"
          v-model="search"
          type="text"
          placeholder="Search country..."
          class="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500"
        />
      </div>

      <!-- Country list -->
      <div class="max-h-48 overflow-y-auto">
        <button
          v-for="country in filteredCountries"
          :key="country.code"
          type="button"
          :class="[
            'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
            country.code === selectedCountry
              ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-300',
          ]"
          @mousedown.prevent="selectCountry(country.code)"
        >
          <span class="text-lg leading-none">{{ country.flag }}</span>
          <span class="flex-1 truncate text-xs">{{ country.name }}</span>
          <span class="text-[11px] text-gray-400 dark:text-gray-500 font-mono">{{ country.dialCode }}</span>
        </button>
        <p
          v-if="filteredCountries.length === 0"
          class="px-3 py-4 text-center text-xs text-gray-400 dark:text-gray-500"
        >
          No countries found
        </p>
      </div>
    </div>
  </div>
</template>
