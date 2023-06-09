import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { Account } from "../../commons/types";
import { Schema, SchemaModel, StringType } from "schema-typed";
import { Button, Form, InputGroup } from "rsuite";
import "./styles.css";
import { Branch, EyeClose, Send, UserBadge, Visible } from "@rsuite/icons";
import DataStore from "../../commons/middleware/DataStore";
import { useMiddlewareContext } from "../../commons/middleware/context";
import { PATH_LOGIN } from "../../commons/middleware/paths";
import { PATH_DEFAULT, PATH_ROOT } from "../Sidebar/paths";
import { useMyToaster } from "../../commons/hooks";
import { useMyNavigate } from "../../commons/middleware/hooks";

type AccountTypingTokenDTO = Pick<Account, "name"> & Pick<Account, "password">;

const defaultState: AccountTypingTokenDTO = {
  name: "",
  password: "",
};

export default function Login() {
  const { metadataInit, user, setUser } = useMiddlewareContext();
  const [isPassVisible, setPassVisible] = useState<boolean>(false);
  const [typing, setTyping] = useState<AccountTypingTokenDTO>(defaultState);
  const deferredTyping = useDeferredValue(typing);
  const toaster = useMyToaster("Login", "error", () => setPassVisible(false));
  const navigate = useMyNavigate(toaster);
  const [transitionPending, startTransition] = useTransition();

  if (!!user && !transitionPending) {
    // Be sure it sounds being a bug (-:
    const error = "Login() frontend unauthorized access";
    localStorage.setItem(error, Date.now().toString());
    console.error(error);

    // Don't wait for render lifecycle at login, despite that.
    // It would be a bad practice, we are handling an unexisting case
    // but avoiding maybe browser's related bugs. This component is
    // purely internally js managed despite all. (no uri)
    startTransition(() => navigate(PATH_ROOT));
  }

  const schema = useMemo<
    Schema<AccountTypingTokenDTO, string> | undefined
  >(() => {
    if (metadataInit) {
      return SchemaModel<AccountTypingTokenDTO>({
        name: StringType()
          .rangeLength(
            metadataInit.rules.text_short.min,
            metadataInit.rules.text_short.max
          )
          .isRequired(),
        password: StringType()
          .rangeLength(
            metadataInit.rules["text_short#_"].min,
            metadataInit.rules["text_short#_"].max
          )
          .containsLetter()
          .containsNumber()
          .containsUppercaseLetter()
          .containsLowercaseLetter()
          .isRequired(),
      });
    }
  }, [metadataInit]);

  const handleCardClick = (): void => {
    setPassVisible(false);
    setTyping(defaultState);
  };

  const handlePassClick = (): void => setPassVisible(!isPassVisible);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> =>
    startTransition(() => {
      let error: number;
      DataStore.doFetch(
        metadataInit?.apiPrefix + "/" + PATH_LOGIN,
        async (url) => {
          const res = await fetch(url, {
            method: "POST",
            body: new FormData(e.currentTarget),
          });
          if (!res.ok) {
            error = res.status;
          } else {
            await setUser(await res.json());
          }
          return res;
        },
        false
      )
        .then(() => navigate(PATH_DEFAULT))
        .catch(() =>
          toaster.toast(
            error === 500 ? "No response from server" : "Bad credentials"
          )
        );
    });

  return (
    <div id="login__root">
      <h1>
        <Branch />
        Intranet
      </h1>
      <div id="login__container">
        <Form
          fluid
          formValue={deferredTyping}
          model={schema}
          onChange={(val) => setTyping((typing) => ({ ...typing, ...val }))}
          layout="vertical"
          onSubmit={(check, e) => check && handleLogin(e)}
        >
          <InputGroup>
            <InputGroup.Button onClick={handleCardClick} type="reset">
              <UserBadge />
            </InputGroup.Button>
            <Form.Group controlId="name">
              <Form.Control name="name" placeholder="Username" />
            </Form.Group>
          </InputGroup>
          <InputGroup>
            <InputGroup.Button onClick={handlePassClick}>
              {isPassVisible ? <Visible /> : <EyeClose />}
            </InputGroup.Button>
            <Form.Group controlId="password">
              <Form.Control
                name="password"
                type={isPassVisible ? undefined : "password"}
                placeholder="Password"
              />
            </Form.Group>
          </InputGroup>
          <Button
            block
            ripple
            appearance="primary"
            endIcon={<Send />}
            loading={transitionPending}
            type="submit"
          >
            Login
          </Button>
        </Form>
      </div>
    </div>
  );
}
