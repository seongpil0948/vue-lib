import { IoUser, IO_ENV, USER_ROLE, USER_DB } from "@io-boxies/js-lib";
import { defineComponent } from "vue";
import { useElasticSearch } from "../../composables";
import throttle from "lodash.throttle";
import { NAutoComplete, AutoCompleteOption, NSpace, NSelect } from "naive-ui";
import { ref } from "vue";

export interface UserSearchResult {
  id: string;
  createdat: string;
  role: USER_ROLE;
  email: string;
  username: string;
}

export const SearchUserAuto = defineComponent({
  name: "SearchUserAuto",
  props: {
    searchSize: {
      type: Number,
      default: () => 10,
    },
    env: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: () => "유저선택",
    },
    showRoleSelector: {
      type: Boolean,
      default: () => false,
    },
  },
  emits: {
    onResult(data: UserSearchResult[]) {
      return data;
    },
    onSelect(user: IoUser) {
      return user;
    },
  },
  setup(props, { emit }) {
    console.log("login view props env in vue-lib:", props.env);
    const options = ref<AutoCompleteOption[]>([]);
    const makeOption = (name: string, userId: string): AutoCompleteOption => ({
      label: name,
      value: userId,
    });
    const role = ref<USER_ROLE | null>(null);
    const roleOpt = Object.keys(USER_ROLE).map((x) => {
      return {
        label: x,
        value: x,
      };
    });
    const { searchInputVal, searchData, search, msg } = useElasticSearch({
      env: props.env as IO_ENV,
      funcName: "elasticInoutBoxSearch",
      onSearch: async (result) => {
        options.value = [];
        const searchResult: UserSearchResult[] = result.data.hits.hits.map(
          (x: any) => x._source as UserSearchResult
        );
        emit("onResult", searchResult);
        if (searchResult.length > 0) {
          searchResult.forEach((r) =>
            options.value.push(makeOption(r.username, r.id))
          );
          return searchResult;
        } else {
          msg.info("검색 결과가 없습니다.");
          searchData.value = [];
        }
      },
      makeParam: (input) => {
        const query: any = {
          bool: {
            should: [
              {
                multi_match: {
                  query: input,
                  fields: ["email", "id"],
                },
              },
              {
                fuzzy: {
                  username: {
                    value: input,
                    fuzziness: "AUTO",
                    max_expansions: 10,
                    transpositions: true,
                    rewrite: "constant_score",
                  },
                },
              },
            ],
          },
        };
        if (role.value) {
          query.bool.must = [
            {
              match: { role: role.value },
            },
          ];
        }

        return {
          index:
            import.meta.env.MODE === "production"
              ? ".ent-search-engine-documents-io-box-user-prod-search"
              : ".ent-search-engine-documents-io-box-user-dev-search",
          query,
          from: 0,
          size: props.searchSize,
        };
      },
    });
    const searching = throttle(async () => {
      await search();
    }, 1000);
    const onUpdate = async (val: string | undefined) => {
      searchInputVal.value = val ?? null;
      await searching();
    };
    const onUpdateRole = async (r: USER_ROLE) => {
      role.value = r;
      await searching();
    };
    async function onSelect(value: string | number) {
      const u = await USER_DB.getUserById(value.toString());
      if (!u) throw new Error(`user: ${value} is not exist`);
      emit("onSelect", u);
    }
    return {
      searchInputVal,
      search,
      onUpdate,
      onSelect,
      options,
      role,
      roleOpt,
      onUpdateRole,
    };
  },
  render() {
    const { showRoleSelector, onUpdateRole } = this;
    const renderAuto = () => (
      <NAutoComplete
        value={this.searchInputVal ?? undefined}
        onUpdateValue={this.onUpdate}
        placeholder={this.placeholder}
        inputProps={{ autocomplete: "disabled}" }}
        options={this.options}
        onSelect={this.onSelect}
      ></NAutoComplete>
    );
    return showRoleSelector ? (
      <NSpace>
        {{
          default: () => [
            <NSelect
              value={this.role}
              onUpdateValue={onUpdateRole}
              options={this.roleOpt}
              placeholder={"유저역할선택"}
              style={{
                minWidth: "120px",
              }}
              clearable={true}
            ></NSelect>,
            renderAuto(),
          ],
        }}
      </NSpace>
    ) : (
      renderAuto()
    );
  },
});
